SELECT
  (SELECT COUNT(*) FROM `pelagic-height-474717-e7.supply_chain_data.shipments`) AS total_shipments,
  (SELECT COUNT(*) FROM `pelagic-height-474717-e7.supply_chain_data.decisions`) AS total_decisions,
  (SELECT COUNT(DISTINCT shipment_id) FROM `pelagic-height-474717-e7.supply_chain_data.decisions`) AS unique_decision_shipments
