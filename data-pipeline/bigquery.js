const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();
const datasetId = 'supply_chain_data';
const tableId = 'shipments';
const decisionsTableId = 'decisions';

/**
 * Initializes the BigQuery dataset and table if they don't exist.
 */
async function initializeBigQuery() {
    try {
        // Create dataset if it doesn't exist
        const [datasetExists] = await bigquery.dataset(datasetId).exists();
        if (!datasetExists) {
            console.log(`Dataset ${datasetId} does not exist. Creating...`);
            await bigquery.createDataset(datasetId, { location: 'US' });
            console.log(`Dataset ${datasetId} created.`);
        } else {
            console.log(`Dataset ${datasetId} already exists.`);
        }

        // Create table if it doesn't exist
        const dataset = bigquery.dataset(datasetId);
        const [tableExists] = await dataset.table(tableId).exists();
        if (!tableExists) {
            console.log(`Table ${tableId} does not exist. Creating...`);
            const schema = [
                { name: 'shipment_id', type: 'STRING', mode: 'REQUIRED' },
                { name: 'current_location', type: 'STRING' },
                { name: 'destination', type: 'STRING' },
                { name: 'status', type: 'STRING' },
                { name: 'route_id', type: 'STRING' },
                { name: 'timestamp', type: 'TIMESTAMP' },
            ];
            await dataset.createTable(tableId, { schema });
            console.log(`Table ${tableId} created.`);
        } else {
            console.log(`Table ${tableId} already exists.`);
        }

        const [decisionsTableExists] = await dataset.table(decisionsTableId).exists();
        if (!decisionsTableExists) {
            console.log(`Table ${decisionsTableId} does not exist. Creating...`);
            const decisionsSchema = [
                { name: 'shipment_id', type: 'STRING' },
                { name: 'risk_level', type: 'STRING' },
                { name: 'disruption_reason', type: 'STRING' },
                { name: 'recommended_action', type: 'STRING' },
                { name: 'suggested_route', type: 'STRING' },
                { name: 'confidence_score', type: 'FLOAT' },
                { name: 'timestamp', type: 'TIMESTAMP' },
            ];
            await dataset.createTable(decisionsTableId, { schema: decisionsSchema });
            console.log(`Table ${decisionsTableId} created.`);
        } else {
            console.log(`Table ${decisionsTableId} already exists.`);
        }
    } catch (error) {
        console.error('Error initializing BigQuery:', error);
    }
}

/**
 * Inserts rows into the shipments table.
 * @param {Array<Object>} rows - Array of objects containing shipment data
 */
async function insertShipments(rows) {
    try {
        await bigquery
            .dataset(datasetId)
            .table(tableId)
            .insert(rows);
        console.log(`Inserted ${rows.length} row(s) into BigQuery.`);
    } catch (error) {
        console.error('Error inserting data into BigQuery:', error);
        if (error.name === 'PartialFailureError') {
            console.error(JSON.stringify(error.errors, null, 2));
        }
        throw error;
    }
}

/**
 * Inserts rows into the decisions table.
 * @param {Array<Object>} rows - Array of objects containing decision data
 */
async function insertDecisions(rows) {
    try {
        await bigquery
            .dataset(datasetId)
            .table(decisionsTableId)
            .insert(rows);
        console.log(`Inserted ${rows.length} decision(s) into BigQuery.`);
    } catch (error) {
        console.error('Error inserting data into decisions BigQuery:', error);
        if (error.name === 'PartialFailureError') {
            console.error(JSON.stringify(error.errors, null, 2));
        }
        throw error;
    }
}

module.exports = {
    initializeBigQuery,
    insertShipments,
    insertDecisions
};
