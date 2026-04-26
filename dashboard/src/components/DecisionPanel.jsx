export default function DecisionPanel({ shipment }) {
  if (!shipment) {
    return (
      <div className="decision-detail">
        <div className="empty" style={{ padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛰️</div>
          <div>Select a shipment to view AI analysis</div>
        </div>
      </div>
    );
  }

  const risk = shipment.risk_level || 'UNKNOWN';
  const conf = shipment.confidence_score || 0;
  const confPct = Math.round(conf * 100);

  return (
    <div className="decision-detail">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontWeight: 700, fontSize: 15 }}>
            {shipment.shipment_id}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {shipment.route_id}
          </div>
        </div>
        <span className={`risk-badge ${risk}`}>{risk} RISK</span>
      </div>

      {/* Route */}
      <div className="detail-section">
        <div className="detail-label">Route</div>
        <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--blue)' }}>{shipment.current_location}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>{shipment.destination}</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <span className={`status-badge ${(shipment.status || '').replace(' ', '-')}`}>
            {shipment.status}
          </span>
        </div>
      </div>

      {/* AI Reasoning */}
      {shipment.disruption_reason ? (
        <div className="detail-section">
          <div className="detail-label">🧠 AI Analysis</div>
          <div className="detail-value" style={{ fontSize: 12, lineHeight: 1.6 }}>
            {shipment.disruption_reason}
          </div>
        </div>
      ) : (
        <div className="detail-section">
          <div className="detail-label">🧠 AI Analysis</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No AI decision generated yet for this shipment.</div>
        </div>
      )}

      {/* Recommended Action */}
      {shipment.recommended_action && (
        <div className="detail-section" style={{ borderColor: risk === 'HIGH' ? 'rgba(255,51,102,0.3)' : risk === 'MEDIUM' ? 'rgba(255,193,7,0.3)' : 'rgba(0,255,136,0.3)' }}>
          <div className="detail-label">✅ Recommended Action</div>
          <div className="detail-value" style={{ fontSize: 12, lineHeight: 1.6 }}>
            {shipment.recommended_action}
          </div>
        </div>
      )}

      {/* Suggested Route */}
      {shipment.suggested_route && (
        <div className="detail-section">
          <div className="detail-label">🗺️ Suggested Route</div>
          <div className="detail-value mono">{shipment.suggested_route}</div>
        </div>
      )}

      {/* Confidence */}
      <div className="detail-section">
        <div className="detail-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>AI Confidence</span>
          <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{confPct}%</span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${confPct}%` }} />
        </div>
      </div>

      {/* Timestamp */}
      {shipment.timestamp && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          Updated: {new Date(shipment.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
