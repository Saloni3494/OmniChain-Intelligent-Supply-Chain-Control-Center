const { BigQuery } = require('@google-cloud/bigquery');
const bq = new BigQuery({ projectId: 'pelagic-height-474717-e7' });

async function createModel() {
  const query = `
    CREATE OR REPLACE MODEL \`supply_chain_data.delay_forecast_model\`
    OPTIONS(
      model_type='logistic_reg',
      input_label_cols=['is_delayed']
    ) AS
    SELECT 
      current_location,
      destination,
      IF(status = 'delayed', 1, 0) as is_delayed
    FROM \`supply_chain_data.shipments\`
    WHERE status IN ('delayed', 'delivered')
  `;

  console.log('Creating BQ ML model... this may take a minute.');
  try {
    const [job] = await bq.createQueryJob({ query });
    await job.promise();
    console.log('Model created successfully!');
  } catch (err) {
    console.error('Error creating model:', err);
  }
}

createModel();
