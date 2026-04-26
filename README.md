<div align="center">
  <img src="https://storage.googleapis.com/gweb-cloudblog-publish/images/Supply_Chain_Hero.max-2500x2500.jpg" alt="OmniChain Banner" width="100%">
  
  <h1>🌐 OmniChain</h1>
  <p><strong>Intelligent Supply Chain Control Center powered by Google AI</strong></p>
  
  <p>
    Built with ❤️ by <strong>Team SPectra</strong> for the <strong>Google Solution Challenge 2026</strong>.
  </p>
</div>

---

## 🔗 Live Links
- **🌍 Live Dashboard:** [https://pelagic-height-474717-e7.web.app](https://pelagic-height-474717-e7.web.app)
- **⚙️ Backend API:** [https://api-server-2k3orsn3xq-uc.a.run.app](https://api-server-2k3orsn3xq-uc.a.run.app)
- **📡 Data Engine:** [https://data-pipeline-2k3orsn3xq-uc.a.run.app](https://data-pipeline-2k3orsn3xq-uc.a.run.app)

---

## 🚨 The Problem
Modern global supply chains are incredibly fragile. A single disruption—whether due to extreme weather, port congestion, or geopolitical events—can cause a cascading ripple effect resulting in massive financial losses and shortages of critical goods. 

Currently, logistics companies suffer from:
1. **Fragmented Data:** Tracking systems don't communicate with predictive systems.
2. **Reactive Interventions:** Planners only find out about disruptions *after* they happen.
3. **Slow Decision Making:** It takes hours or days to calculate alternative routes and assess the impact of a delay.

## 💡 Our Solution: OmniChain
**OmniChain** is a real-time, proactive Supply Chain Control Center. We ingest massive amounts of streaming telemetry data and pass it through Google's Gemini AI to instantly assess risk levels, predict delays, and automatically recommend alternative routing before the disruption even occurs.

Our platform visualizes the global flow of goods on an interactive map, highlighting at-risk shipments so operators can make split-second, data-driven decisions.

---

## 🌟 Key Features
- **Real-Time Data Ingestion:** Handles high-throughput shipment telemetry data instantly.
- **AI Risk Assessment:** Evaluates weather, traffic, and shipment status to assign a Risk Level (Low, Medium, High).
- **Proactive Mitigation:** Automatically generates recommended actions (e.g., "Reroute via Air Freight", "Priority Handling").
- **Interactive Global Map:** Geospatial tracking of all active shipments using Google Maps.
- **Predictive Analytics Engine:** Learns from historical delays using Machine Learning to forecast future bottlenecks.

---

## 🛠️ Google Technologies & Services Used
We built OmniChain from the ground up to be scalable, leveraging the best of Google Cloud and Google AI:

*   🧠 **Google Gemini 2.5 Flash:** Used for real-time natural language reasoning. It analyzes telemetry data and generates human-readable disruption reasons and mitigation strategies.
*   🤖 **Google Genkit:** Utilized as the orchestration framework to seamlessly integrate Gemini AI into our Node.js data pipeline.
*   ☁️ **Google Cloud Run:** Hosts our containerized Backend API and Data Pipeline, providing autoscaling to handle sudden spikes in global logistics traffic.
*   📨 **Google Cloud Pub/Sub:** Acts as the nervous system of our app, streaming thousands of mock shipment events asynchronously.
*   📊 **Google BigQuery & BigQuery ML:** Serves as our enterprise data warehouse. We use BQ to store shipment history and utilize **BigQuery ML** to train Logistic Regression models directly on our data to predict future delays.
*   🔥 **Firebase Hosting:** Deploys our Vite/React frontend with global CDN caching for ultra-fast load times.
*   🗺️ **Google Maps JavaScript API:** Powers the dynamic, interactive dashboard map showing live coordinates, custom markers, and active transit routes.

---

## 🏗️ System Architecture
1. **Simulator / IoT Devices** push shipment data into a **Cloud Pub/Sub** topic.
2. The **Data Engine (Cloud Run)** receives push events, queries **Gemini AI** for risk analysis, and writes the results to **BigQuery**.
3. The **API Server (Cloud Run)** fetches analytics and live shipment statuses from BigQuery.
4. The **React Dashboard (Firebase)** consumes the API to plot markers on **Google Maps** and display the risk-assessment UI.

---

## 🌍 Impact & Scalability
### **Impact**
OmniChain specifically addresses the **United Nations Sustainable Development Goals (SDGs)**:
- **SDG 9 (Industry, Innovation, and Infrastructure):** By optimizing routing, we increase the resilience of global infrastructure.
- **SDG 12 (Responsible Consumption and Production):** By reducing transit times and preventing perishable goods from expiring during delays, we directly reduce global waste and lower carbon emissions.

### **Scalability**
Because the architecture is entirely serverless (Pub/Sub + Cloud Run + BigQuery), OmniChain can scale from 10 shipments to 10 million shipments per second with zero changes to the underlying infrastructure. 

---

## 🚀 Future Scope
In the future, we plan to expand OmniChain by:
1. **IoT Integration:** Connecting real-time temperature, humidity, and shock sensors for pharmaceutical logistics.
2. **Automated Execution:** Allowing the AI to directly communicate with carrier APIs to automatically reroute shipments without human approval.
3. **Multi-Modal Transport:** Adding support to calculate carbon footprints across maritime, air, rail, and road to suggest the most eco-friendly mitigation strategies.

---

### **Team SPectra**
- *Innovating for a resilient tomorrow.*
