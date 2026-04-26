import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function useRealTimeData() {
  const [shipments, setShipments]   = useState([]);
  const [decisions, setDecisions]   = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [metrics, setMetrics]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError]           = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, dRes, aRes, mRes] = await Promise.all([
        axios.get(`${API}/api/shipments`),
        axios.get(`${API}/api/decisions`),
        axios.get(`${API}/api/alerts`),
        axios.get(`${API}/api/metrics`),
      ]);
      setShipments(sRes.data.shipments || []);
      setDecisions(dRes.data.decisions || []);
      setAlerts(aRes.data.alerts || []);
      setMetrics(mRes.data || {});
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { shipments, decisions, alerts, metrics, loading, lastUpdate, error, refresh: fetchAll };
}
