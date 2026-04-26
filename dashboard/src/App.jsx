import { useState, useEffect } from 'react';
import './index.css';
import { useRealTimeData } from './hooks/useRealTimeData';
import MapView from './components/MapView';
import AlertPanel from './components/AlertPanel';
import DecisionPanel from './components/DecisionPanel';
import SimulationPanel from './components/SimulationPanel';
import MetricsDashboard from './components/MetricsDashboard';
import ChatPanel from './components/ChatPanel';
import ImpactCounter from './components/ImpactCounter';
import SustainabilityPanel from './components/SustainabilityPanel';
import SelfHealPanel from './components/SelfHealPanel';
import LearningFeedbackPanel from './components/LearningFeedbackPanel';

const TABS_RIGHT = ['Decision', 'Simulate', 'Auto-Heal', 'Feedback', 'Chat'];
const TABS_LEFT  = ['Shipments', 'Alerts', 'Sustainability'];

export default function App() {
  const { shipments, alerts, metrics, loading, lastUpdate, error, refresh } = useRealTimeData();
  const [selected, setSelected]       = useState(null);
  const [tabLeft, setTabLeft]         = useState('Shipments');
  const [tabRight, setTabRight]       = useState('Decision');
  const [filter, setFilter]           = useState('ALL');
  const [simFlash, setSimFlash]       = useState(false);

  // Auto-select first high-risk shipment
  useEffect(() => {
    if (!selected && shipments.length) {
      const high = shipments.find(s => s.risk_level === 'HIGH');
      setSelected(high || shipments[0]);
    }
  }, [shipments]);

  // Flash on sim result
  const handleSimResult = () => {
    setSimFlash(true);
    setTimeout(() => setSimFlash(false), 1500);
    refresh();
  };

  const filteredShipments = filter === 'ALL'
    ? shipments
    : filter === 'delayed'
      ? shipments.filter(s => s.status === 'delayed')
      : shipments.filter(s => (s.risk_level || 'UNKNOWN') === filter);

  // Use BigQuery aggregate metrics for accurate header counts
  const highCount   = metrics.high_risk  || shipments.filter(s => s.risk_level === 'HIGH').length;
  const medCount    = metrics.medium_risk || shipments.filter(s => s.risk_level === 'MEDIUM').length;

  return (
    <div className={`app${simFlash ? ' sim-flash' : ''}`}>

      {/* ─── HEADER ─── */}
      <header className="header">
        <div className="header-logo">
          <div className="dot"/>
          <span className="header-title">Omni<span>Chain</span> AI</span>
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginLeft:8 }}>
          Intelligent Supply Chain Control Center
        </div>

        <div className="live-badge">
          <div className="dot"/>
          LIVE
        </div>

        <div className="header-metrics">
          <div className="header-metric">
            <span className="label">Total</span>
            <span className="value blue">{metrics.total_shipments || 0}</span>
          </div>
          <div className="header-metric">
            <span className="label">High Risk</span>
            <span className="value red">{highCount}</span>
          </div>
          <div className="header-metric">
            <span className="label">Medium</span>
            <span className="value yellow">{medCount}</span>
          </div>
          <div className="header-metric">
            <span className="label">Saved</span>
            <span className="value green">${((metrics.cost_savings || 0) / 1000).toFixed(0)}K</span>
          </div>
          <div className="header-metric">
            <span className="label">CO₂</span>
            <span className="value green">-{metrics.carbon_reduction || 18.4}t</span>
          </div>
        </div>

        <div style={{ marginLeft:16, display:'flex', alignItems:'center', gap:10 }}>
          {lastUpdate && (
            <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button className="btn btn-primary" style={{ padding:'6px 14px', fontSize:11 }} onClick={refresh}>
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div style={{ marginLeft:12, fontSize:11, color:'var(--red)', background:'var(--red-bg)', padding:'4px 10px', borderRadius:6 }}>
            ⚠ API: {error}
          </div>
        )}
      </header>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="sidebar-left">
        <div className="scroll-area">
          {/* Impact Counter - animated CO₂ / cost */}
          <div style={{ padding: '12px 12px 0' }}>
            <ImpactCounter metrics={metrics} />
          </div>
          {/* Metrics summary */}
          <MetricsDashboard metrics={metrics} />
          <div className="sep"/>

          {/* Tabs */}
          <div className="tabs" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            {TABS_LEFT.map(t => (
              <button key={t} className={`tab-btn${tabLeft === t ? ' active' : ''}`} onClick={() => setTabLeft(t)}>
                {t} {t === 'Alerts' && alerts.length > 0 && (
                  <span style={{ background:'var(--red)', color:'#fff', borderRadius:8, padding:'1px 6px', marginLeft:4, fontSize:9 }}>
                    {alerts.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Filter row */}
          {tabLeft === 'Shipments' && (
            <div style={{ display:'flex', gap:4, padding:'8px 12px', flexWrap:'wrap', position: 'sticky', top: 37, zIndex: 10, background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {['ALL','HIGH','MEDIUM','LOW','delayed'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding:'2px 8px', fontSize:10, borderRadius:4, border:'1px solid',
                    cursor:'pointer', fontWeight:600,
                    background: filter === f ? 'var(--blue-bg)' : 'transparent',
                    borderColor: filter === f ? 'var(--blue)' : 'var(--border)',
                    color: filter === f ? 'var(--blue)' : 'var(--text-muted)',
                  }}>
                  {f}
                </button>
              ))}
            </div>
          )}

          <div style={{ paddingTop: '8px' }}>
            {loading ? (
              <div className="loading"><div className="spinner"/>Loading shipments...</div>
            ) : tabLeft === 'Shipments' ? (
              filteredShipments.length === 0 ? (
                <div className="empty">No shipments match this filter</div>
              ) : (
                filteredShipments.map(s => (
                  <div
                    key={s.shipment_id}
                    className={`card risk-${s.risk_level || 'UNKNOWN'}${selected?.shipment_id === s.shipment_id ? ' selected' : ''}`}
                    onClick={() => { setSelected(s); setTabRight('Decision'); }}
                    style={{ margin:'0 12px 6px' }}
                  >
                    <div className="card-header">
                       <span className="card-id">{s.shipment_id}</span>
                      <span className={`risk-badge ${s.risk_level || 'UNKNOWN'}`}>{s.risk_level || '—'}</span>
                    </div>
                    <div className="card-body">
                      <div className="route">{s.current_location?.split(',')[0]} → {s.destination?.split(',')[0]}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <span className={`status-badge ${(s.status||'').replace(' ','-')}`}>{s.status}</span>
                        <span style={{ fontSize:10, color:'var(--text-muted)' }}>{s.route_id}</span>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : tabLeft === 'Alerts' ? (
              <div style={{ padding:'12px' }}>
                <AlertPanel alerts={alerts} />
              </div>
            ) : (
              <SustainabilityPanel metrics={metrics} shipments={shipments} />
            )}
          </div>
        </div>
      </aside>

      {/* ─── MAIN / MAP ─── */}
      <main className="main">
        <div className="map-container" style={{ boxShadow: simFlash ? 'inset 0 0 40px rgba(255,51,102,0.3)' : 'none', transition:'box-shadow 0.5s' }}>
          {loading ? (
            <div className="map-fallback">
              <div className="spinner" style={{ width:32, height:32, borderWidth:3 }}/>
              <div>Loading map data...</div>
            </div>
          ) : (
            <MapView
              shipments={filteredShipments}
              selected={selected}
              onSelect={s => { if (s) { setSelected(s); setTabRight('Decision'); } }}
            />
          )}
        </div>
      </main>

      {/* ─── RIGHT SIDEBAR ─── */}
      <aside className="sidebar-right">
        <div className="tabs">
          {TABS_RIGHT.map(t => (
            <button key={t} className={`tab-btn${tabRight === t ? ' active' : ''}`} onClick={() => setTabRight(t)}>
              {t === 'Decision' ? '🧠 Decision' : t === 'Simulate' ? '⚡ What-If' : t === 'Auto-Heal' ? '⚙️ Auto-Heal' : t === 'Feedback' ? '🔄 Feedback' : '💬 Chat'}
            </button>
          ))}
        </div>

        <div className="scroll-area" style={{ overflow: tabRight === 'Chat' ? 'hidden' : 'auto' }}>
          {tabRight === 'Decision' ? (
            <DecisionPanel shipment={selected} />
          ) : tabRight === 'Simulate' ? (
            <SimulationPanel shipments={shipments} onResult={handleSimResult} />
          ) : tabRight === 'Auto-Heal' ? (
            <SelfHealPanel shipment={selected} />
          ) : tabRight === 'Feedback' ? (
            <LearningFeedbackPanel shipment={selected} />
          ) : (
            <ChatPanel shipments={shipments} metrics={metrics} />
          )}
        </div>
      </aside>

    </div>
  );
}
