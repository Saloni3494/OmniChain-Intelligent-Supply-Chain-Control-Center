import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const DISRUPTION_TYPES = [
  'Severe Weather (Hurricane)',
  'Flash Flooding',
  'Traffic Congestion (Major Accident)',
  'Route Blockage (Road Closure)',
  'Port Strike',
  'Fuel Shortage',
  'Equipment Breakdown',
  'Customs Delay',
  'Earthquake',
  'Civil Unrest',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function SimulationPanel({ shipments, onResult }) {
  const [selectedShip, setSelectedShip] = useState('');
  const [disruption, setDisruption]     = useState(DISRUPTION_TYPES[0]);
  const [severity, setSeverity]         = useState('High');
  const [running, setRunning]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState(null);

  const ship = shipments.find(s => s.shipment_id === selectedShip);

  const runSimulation = async () => {
    if (!ship) return;
    setRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post(`${API}/api/simulate`, {
        shipment_id: ship.shipment_id,
        current_location: ship.current_location,
        destination: ship.destination,
        disruption_type: disruption,
        severity,
      });
      setResult(res.data.analysis);
      onResult && onResult({ ...res.data, shipment: ship });
    } catch (e) {
      const respData = e.response?.data;
      if (respData?.quota_exceeded) {
        setError(respData.error);
      } else {
        setError(respData?.error || e.message);
      }
    } finally {
      setRunning(false);
    }
  };

  const formatDate = (s) => {
    if (!s) return '—';
    try { return new Date(s).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return s; }
  };

  return (
    <div>
      <div className="sim-form">
        <div>
          <label>Select Shipment</label>
          <select value={selectedShip} onChange={e => setSelectedShip(e.target.value)}>
            <option value="">— Choose a shipment —</option>
            {shipments.slice(0, 30).map(s => (
              <option key={s.shipment_id} value={s.shipment_id}>
                {s.shipment_id} ({s.status}) — {s.current_location?.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Disruption Type</label>
          <select value={disruption} onChange={e => setDisruption(e.target.value)}>
            {DISRUPTION_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label>Severity</label>
          <select value={severity} onChange={e => setSeverity(e.target.value)}>
            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {ship && (
          <div style={{ padding:'8px', background:'var(--bg-card)', borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--text-secondary)', border:'1px solid var(--border)' }}>
            📍 {ship.current_location} → {ship.destination}<br/>
            Status: <span style={{ color:'var(--yellow)' }}>{ship.status}</span>
            {ship.risk_level && <> · Current Risk: <span className={`risk-badge ${ship.risk_level}`} style={{marginLeft:4}}>{ship.risk_level}</span></>}
          </div>
        )}

        <button
          className="btn btn-danger btn-full"
          onClick={runSimulation}
          disabled={!selectedShip || running}
        >
          {running ? (
            <><div className="spinner" style={{ borderTopColor:'#fff' }}/> Analyzing with Gemini AI...</>
          ) : (
            <><span>⚡</span> Simulate Disruption</>
          )}
        </button>

        {error && (
          <div style={{ color:'var(--red)', fontSize:12, background:'var(--red-bg)', padding:'10px 12px', borderRadius:6, lineHeight:1.5 }}>
            {error.includes('quota') || error.includes('free tier') ? (
              <>
                <div style={{ fontWeight:700, marginBottom:4 }}>⚡ Gemini AI Quota Exceeded</div>
                <div>{error}</div>
              </>
            ) : (
              <><span style={{ fontWeight:700 }}>Error:</span> {error}</>
            )}
          </div>
        )}
      </div>

      {result && (
        <div className="sim-result">
          <div className="result-header">
            <span className={`risk-badge ${result.risk_level}`}>{result.risk_level} RISK</span>
            <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
              Confidence: {Math.round((result.confidence_score || 0) * 100)}%
            </span>
          </div>

          {/* Impact */}
          <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5, marginBottom:10 }}>
            {result.disruption_reason}
          </div>

          {/* Before / After ETA */}
          <div className="before-after">
            <div className="box before">
              <div className="box-label">Original ETA</div>
              <div className="box-value" style={{ color:'var(--yellow)' }}>{formatDate(result.before_eta)}</div>
            </div>
            <div className="box after">
              <div className="box-label">Revised ETA</div>
              <div className="box-value" style={{ color:'var(--red)' }}>{formatDate(result.after_eta)}</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8 }}>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>
              ⏱ Delay <span style={{ color:'var(--red)', fontWeight:700 }}>+{result.delay_estimate_hours}h</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>
              💸 Impact <span style={{ color:'var(--red)', fontWeight:700 }}>${(result.cost_impact_usd || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Recommended Action */}
          <div style={{ marginTop:10, padding:'8px', background:'rgba(0,212,255,0.05)', borderRadius:6, border:'1px solid rgba(0,212,255,0.15)' }}>
            <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>AI Recommendation</div>
            <div style={{ fontSize:12, color:'var(--text-primary)', lineHeight:1.5 }}>{result.recommended_action}</div>
          </div>

          {/* Suggested Route */}
          {result.suggested_route && (
            <div style={{ marginTop:8, fontSize:11, color:'var(--blue)', fontFamily:'var(--font-mono)' }}>
              🗺 Route: {result.suggested_route}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
