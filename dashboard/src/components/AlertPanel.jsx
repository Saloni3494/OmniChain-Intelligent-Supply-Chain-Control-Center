import { formatDistanceToNow } from 'date-fns';

export default function AlertPanel({ alerts }) {
  if (!alerts.length) return <div className="empty">No active alerts</div>;

  return (
    <div>
      {alerts.map((a, i) => (
        <div key={`${a.shipment_id}-${i}`} className={`alert-item ${a.risk_level}`}>
          <span className="alert-icon">{a.risk_level === 'HIGH' ? '🔴' : '⚠️'}</span>
          <div className="alert-content">
            <div className="alert-title">
              {a.risk_level === 'HIGH' ? 'Critical Alert' : 'Warning'} — {a.shipment_id}
            </div>
            <div className="alert-body">
              {a.current_location} → {a.destination} · {a.status}
              {a.disruption_reason && (
                <div style={{ marginTop: 4 }}>
                  {a.disruption_reason.slice(0, 120)}...
                </div>
              )}
            </div>
            {a.timestamp && (
              <div className="alert-time">
                {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
