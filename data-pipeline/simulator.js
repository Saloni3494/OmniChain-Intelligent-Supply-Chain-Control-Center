const { PubSub } = require('@google-cloud/pubsub');

// Initialize Pub/Sub client
const pubsub = new PubSub();
const topicName = 'shipment-stream';

// Mock logistics data
const LOCATIONS = [
    'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Seattle, WA', 'Denver, CO', 'Miami, FL', 'Atlanta, GA', 'Boston, MA'
];

/**
 * Initializes the Pub/Sub topic if it doesn't already exist.
 */
async function initializePubSub() {
    try {
        console.log(`Checking/creating topic: ${topicName}...`);
        const [topic] = await pubsub.topic(topicName).get({ autoCreate: true });
        console.log(`Topic ${topic.name} is ready.`);
        return topic;
    } catch (err) {
        console.error('Error initializing Pub/Sub topic:', err);
        process.exit(1);
    }
}

/**
 * Generates a mock shipment event payload.
 */
function generateShipmentEvent() {
    const id = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    const startLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    let endLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    
    // Ensure destination is different from start location
    while (endLoc === startLoc) {
        endLoc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    }
    
    // Status distribution
    const statusRand = Math.random();
    let status = 'in transit';
    if (statusRand > 0.8) status = 'delayed'; // 15% chance
    if (statusRand > 0.95) status = 'delivered'; // 5% chance

    return {
        shipment_id: `SHP-${id}`,
        current_location: startLoc,
        destination: endLoc,
        status: status,
        route_id: `RT-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString()
    };
}

/**
 * Starts continuous simulation of shipment events.
 */
async function startSimulation() {
    const topic = await initializePubSub();
    console.log('Starting OmniChain Data Simulator...');
    console.log('Press Ctrl+C to stop.\n');

    // Interval to produce events
    setInterval(async () => {
        // Publish 1 event per interval to conserve quota
        const batchSize = 1;
        
        const publishPromises = [];
        for (let i = 0; i < batchSize; i++) {
            const event = generateShipmentEvent();
            const dataBuffer = Buffer.from(JSON.stringify(event));

            // Publish message
            const promise = topic.publishMessage({ data: dataBuffer })
                .then(messageId => {
                    console.log(`Published event ${event.shipment_id} | Status: ${event.status} | Msg ID: ${messageId}`);
                })
                .catch(error => {
                    console.error(`Error publishing event ${event.shipment_id}:`, error);
                });
                
            publishPromises.push(promise);
        }
        
        await Promise.all(publishPromises);
    }, 60 * 60 * 1000); // Trigger every 1 hour
}

startSimulation();
