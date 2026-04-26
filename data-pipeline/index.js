const express = require('express');
const { initializeBigQuery, insertShipments, insertDecisions } = require('./bigquery');
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

const app = express();

// Cloud Run receives push events as HTTP POST requests with a JSON body
app.use(express.json());

const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';

// Initialize Genkit
const ai = genkit({
    plugins: [googleAI({ apiKey: GEMINI_API_KEY })]
});

async function analyzeShipment(shipment) {
    const prompt = `You are an advanced Supply Chain AI. Analyze the following shipment data to detect potential disruptions.
Consider status, delays, locations, and simulate external factors.

Shipment Data:
${JSON.stringify(shipment, null, 2)}

Provide your analysis in JSON format with exactly these fields:
- "risk_level": "LOW", "MEDIUM", or "HIGH"
- "disruption_reason": Explanation of why a disruption might occur (e.g., weather, congestion)
- "recommended_action": A mitigation strategy (e.g., "Reroute", "Priority Handling")
- "suggested_route": A suggested alternate route ID or description
- "confidence_score": A float between 0.0 and 1.0 indicating your confidence in this assessment`;

    const { text } = await ai.generate({
        model: 'googleai/' + GEMINI_MODEL,
        prompt: prompt,
    });
    const responseText = text;

    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse Gemini response:", responseText);
        return null;
    }
}

app.post('/', async (req, res) => {
    try {
        if (!req.body) {
            const msg = 'No Pub/Sub message received';
            console.error(`Error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
        }

        if (!req.body.message) {
            const msg = 'Invalid Pub/Sub message format';
            console.error(`Error: ${msg}`);
            res.status(400).send(`Bad Request: ${msg}`);
            return;
        }

        // Pub/Sub push messages are base64-encoded
        const pubSubMessage = req.body.message;
        const messageData = pubSubMessage.data
            ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
            : null;

        if (!messageData) {
            console.warn('Received empty message data.');
            // Send 200 so Pub/Sub doesn't retry empty messages
            res.status(200).send();
            return;
        }

        // Parse the JSON data from the event
        let shipmentEvent;
        try {
            shipmentEvent = JSON.parse(messageData);
        } catch (err) {
            console.error('Error parsing JSON from message:', err);
            res.status(200).send();
            return;
        }

        // Validate required fields based on BigQuery schema
        const { shipment_id, current_location, destination, status, route_id, timestamp } = shipmentEvent;
        if (!shipment_id || !current_location || !destination || !status || !route_id || !timestamp) {
            console.error('Invalid message format. Missing required fields:', shipmentEvent);
            res.status(200).send();
            return;
        }

        console.log(`Processing shipment event: ${shipment_id} - ${status}`);

        // Prepare row for BigQuery
        const row = {
            shipment_id,
            current_location,
            destination,
            status,
            route_id,
            timestamp: new Date(timestamp).toISOString() // format to standard ISO
        };

        // Insert into BigQuery
        await insertShipments([row]);

        // Generate AI insights
        try {
            const aiAnalysis = await analyzeShipment(row);
            if (aiAnalysis) {
                const decisionRow = {
                    shipment_id: row.shipment_id,
                    risk_level: aiAnalysis.risk_level || 'UNKNOWN',
                    disruption_reason: aiAnalysis.disruption_reason || 'N/A',
                    recommended_action: aiAnalysis.recommended_action || 'N/A',
                    suggested_route: aiAnalysis.suggested_route || 'N/A',
                    confidence_score: typeof aiAnalysis.confidence_score === 'number' ? aiAnalysis.confidence_score : 0.0,
                    timestamp: new Date().toISOString()
                };
                
                await insertDecisions([decisionRow]);
                console.log(`Generated decision for ${row.shipment_id}: ${decisionRow.risk_level} Risk`);
            }
        } catch (aiErr) {
            console.error('Error during AI analysis:', aiErr);
            // Don't fail the whole request if AI analysis fails
        }

        // Acknowledge the message to Pub/Sub
        res.status(200).send('Message processed successfully');
    } catch (err) {
        console.error('Error processing Pub/Sub message:', err);
        // Returning a 5xx status tells Pub/Sub to retry delivery
        res.status(500).send('Internal Server Error');
    }
});

// Start the Cloud Run server
app.listen(PORT, async () => {
    console.log(`OmniChain Data Engine listening on port ${PORT}`);
    // Initialize BigQuery dataset and table on startup
    await initializeBigQuery();
});
