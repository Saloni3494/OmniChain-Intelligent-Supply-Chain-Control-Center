# OmniChain AI – Real-Time Supply Chain Data Engine

This project contains the real-time data ingestion pipeline for OmniChain AI. It handles continuous logistics data streams and acts as the foundation for our predictive disruption detection and dynamic route optimization engines.

## 🚀 Architecture Overview
**Event-driven Flow:**  
`Data Simulator` → `Google Cloud Pub/Sub` → `Google Cloud Run (Push)` → `Google BigQuery`

1. **Ingestion (Pub/Sub)**: `shipment-stream` topic receives high-throughput logistics events.
2. **Processing (Cloud Run)**: A stateless Node.js microservice receives messages via a Pub/Sub Push Subscription. It validates and normalizes the data.
3. **Storage (BigQuery)**: Validated events are inserted in near real-time into the `supply_chain_data.shipments` BigQuery table for downstream AI processing.

---

## 🛠 Prerequisites

1. **Google Cloud SDK (`gcloud`)** installed and authenticated.
2. **Node.js** (v20 or higher) for local testing/simulation.
3. Google Cloud Project with billing enabled.

---

## ☁️ Deployment Instructions

### 1. Enable Required APIs
```bash
gcloud services enable pubsub.googleapis.com run.googleapis.com bigquery.googleapis.com cloudbuild.googleapis.com
```

### 2. Set Up BigQuery (Optional, Auto-Creates)
The Cloud Run service is designed to automatically create the dataset (`supply_chain_data`) and table (`shipments`) on startup. However, ensure the service account running Cloud Run has the necessary permissions (`BigQuery Data Editor`, `BigQuery User`).

### 3. Create the Pub/Sub Topic
```bash
gcloud pubsub topics create shipment-stream
```

### 4. Deploy to Cloud Run
Deploy the application directly from the source code. Let Cloud Build handle the containerization.

```bash
# Execute this in the same directory as this README and package.json
gcloud run deploy omnichain-data-engine \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --timeout 60s \
  --concurrency 80
```
*Note the **Service URL** output by this command, you will need it for the next step.*

### 5. Create the Pub/Sub Push Subscription
Link the Pub/Sub topic to your newly deployed Cloud Run service.

```bash
# Replace <YOUR_CLOUD_RUN_SERVICE_URL> with the actual URL from step 4
gcloud pubsub subscriptions create shipment-sub \
  --topic shipment-stream \
  --push-endpoint=<YOUR_CLOUD_RUN_SERVICE_URL> \
  --ack-deadline=60
```

*Note: For production, you should secure the push endpoint using service account authentication, but `--allow-unauthenticated` is suitable for the demo.*

---

## 🧪 Demo Scenario: Running the Simulator

To simulate 50–100 concurrent shipment events streaming in real-time, run the local simulator script. The script connects to your Google Cloud Project (via your local Application Default Credentials) and continuously generates randomized logistics events.

### 1. Authenticate locally
Make sure you are authenticated to your Google Cloud project locally so the simulator can publish to Pub/Sub:
```bash
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Simulator
```bash
npm run simulate
```

You will start seeing events like:
```text
Checking/creating topic: shipment-stream...
Topic projects/YOUR_PROJECT_ID/topics/shipment-stream is ready.
Starting OmniChain Data Simulator...
Press Ctrl+C to stop.

Published event SHP-837194 | Status: in transit | Msg ID: 1092837491
Published event SHP-112391 | Status: delayed | Msg ID: 1092837492
```

### 4. Monitor & Verify
1. **Cloud Run Logs**: Go to the Google Cloud Console → Cloud Run → `omnichain-data-engine` → Logs. You will see "Processing shipment event..." logs.
2. **BigQuery**: Go to BigQuery in the Console. Query the live data:
   ```sql
   SELECT * FROM `supply_chain_data.shipments` ORDER BY timestamp DESC LIMIT 100;
   ```

## 🧠 Future AI Integrations
This pipeline lays the groundwork for OmniChain AI's intelligent features:
* **Predictive Disruption Detection**: AI models can consume the live BigQuery feed and analyze historical patterns to predict delays.
* **Dynamic Route Optimization**: If a shipment status changes to `delayed`, a downstream Pub/Sub trigger can execute a routing optimization function to reroute pending shipments.
