CREATE OR REPLACE MODEL `pelagic-height-474717-e7.supply_chain_data.risk_prediction_model`
OPTIONS(
  model_type = 'LOGISTIC_REG',
  input_label_cols = ['is_high_risk'],
  max_iterations = 20,
  ls_init_learn_rate = 0.1
) AS
SELECT
  -- Features derived from route characteristics
  LENGTH(s.current_location) AS origin_city_len,
  LENGTH(s.destination) AS dest_city_len,
  CAST(REGEXP_EXTRACT(s.route_id, r'RT-(\d+)') AS INT64) AS route_num,
  CASE s.status
    WHEN 'delayed'    THEN 2
    WHEN 'in-transit' THEN 1
    WHEN 'processing' THEN 0
    ELSE 1
  END AS status_code,
  TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), s.timestamp, HOUR) AS hours_since_update,
  -- Label: 1 if HIGH risk, 0 otherwise
  IF(d.risk_level = 'HIGH', 1, 0) AS is_high_risk
FROM
  `pelagic-height-474717-e7.supply_chain_data.shipments` s
INNER JOIN (
  SELECT shipment_id, risk_level,
    ROW_NUMBER() OVER (PARTITION BY shipment_id ORDER BY timestamp DESC) AS rn
  FROM `pelagic-height-474717-e7.supply_chain_data.decisions`
) d ON s.shipment_id = d.shipment_id AND d.rn = 1
WHERE
  d.risk_level IN ('HIGH', 'MEDIUM', 'LOW')
  AND s.timestamp IS NOT NULL
  AND REGEXP_CONTAINS(s.route_id, r'RT-\d+')
