import { useState, useEffect } from 'react';

// Deterministic domain assignment based on shipment ID
function getDomain(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const domains = [
    { name: 'Medical', policy: 'Strict ETA. Auto-reroute always active.' },
    { name: 'Agriculture', policy: 'Freshness critical. Avoid delay > 4 hrs.' },
    { name: 'Electronics', policy: 'High value. Reroute on medium/high risk.' },
    { name: 'Automotive', policy: 'JIT manufacturing. Minimize delay.' },
    { name: 'Retail', policy: 'Standard priority. Optimize for cost.' }
  ];
  return domains[Math.abs(hash) % domains.length];
}

export default function SelfHealPanel({ shipment }) {
  const [step, setStep] = useState(0);
  const [actionTaken, setActionTaken] = useState(false);

  useEffect(() => {
    // Reset simulation when shipment changes
    setStep(0);
    setActionTaken(false);

    if (shipment) {
      // Simulate the self-healing step flow
      const timers = [
        setTimeout(() => setStep(1), 800), // Data comes in
        setTimeout(() => setStep(2), 1600), // AI predicts risk
        setTimeout(() => setStep(3), 2400), // Decision engine checks
        setTimeout(() => setStep(4), 3200)  // System applies route
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [shipment?.shipment_id]);

  if (!shipment) {
    return (
      <div className="decision-detail">
        <div className="empty" style={{ padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
          <div>Select a shipment to view Auto-Heal status</div>
        </div>
      </div>
    );
  }

  const domain = getDomain(shipment.shipment_id);
  const risk = shipment.risk_level || 'UNKNOWN';
  const conf = shipment.confidence_score || Math.random();
  const confPct = Math.round(conf * 100);

  // Determine autonomous action based on confidence and domain policy
  let autoDecision = 'alert';
  if (domain.name === 'Medical' || conf >= 0.85) {
    autoDecision = 'auto_execute';
  } else if (conf >= 0.60) {
    autoDecision = 'ask_user';
  }

  return (
    <div className="decision-detail" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background glow based on action */}
      <div style={{
        position: 'absolute', top: '-50px', left: '-50px', right: '-50px', height: '100px',
        background: autoDecision === 'auto_execute' ? 'radial-gradient(ellipse at top, rgba(0,255,136,0.15) 0%, transparent 70%)' :
                    autoDecision === 'ask_user' ? 'radial-gradient(ellipse at top, rgba(255,193,7,0.15) 0%, transparent 70%)' :
                    'radial-gradient(ellipse at top, rgba(255,51,102,0.15) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontWeight: 700, fontSize: 15 }}>
            {shipment.shipment_id}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Self-Healing Engine
          </div>
        </div>
        <span className={`status-badge active`} style={{ border: '1px solid var(--blue)', color: 'var(--blue)' }}>
          ⚙️ AUTONOMOUS
        </span>
      </div>

      {/* Domain Policy */}
      <div className="detail-section" style={{ position: 'relative', zIndex: 1, marginTop: 16 }}>
        <div className="detail-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📦 Domain Context:</span>
          <strong style={{ color: '#fff' }}>{domain.name}</strong>
        </div>
        <div className="detail-value" style={{ fontSize: 11, fontStyle: 'italic', marginTop: 4 }}>
          Policy: {domain.policy}
        </div>
      </div>

      {/* Flow Steps */}
      <div className="detail-section" style={{ position: 'relative', zIndex: 1 }}>
        <div className="detail-label">⚡ Execution Flow</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          {/* Step 1: Data Ingest */}
          <div style={{ display: 'flex', gap: 12, opacity: step >= 1 ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            <div style={{ color: step >= 1 ? 'var(--blue)' : 'var(--text-muted)' }}>1.</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Data Ingest</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Traffic, weather, delay signals received</div>
            </div>
          </div>

          {/* Step 2: AI Risk Prediction */}
          <div style={{ display: 'flex', gap: 12, opacity: step >= 2 ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            <div style={{ color: step >= 2 ? 'var(--yellow)' : 'var(--text-muted)' }}>2.</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>AI Risk Assessment</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Predicted Risk: <span className={`risk-badge ${risk}`} style={{ fontSize: 9, padding: '1px 4px' }}>{risk}</span></div>
            </div>
          </div>

          {/* Step 3: Decision Engine Checks */}
          <div style={{ display: 'flex', gap: 12, opacity: step >= 3 ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            <div style={{ color: step >= 3 ? 'var(--green)' : 'var(--text-muted)' }}>3.</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Policy & Confidence Check</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Confidence: <span style={{ color: '#fff' }}>{confPct}%</span>
                <span style={{ margin: '0 6px' }}>|</span>
                Threshold: {confPct >= 85 || domain.name === 'Medical' ? 'MET' : 'NOT MET'}
              </div>
            </div>
          </div>

          {/* Step 4: Action */}
          <div style={{ display: 'flex', gap: 12, opacity: step >= 4 ? 1 : 0.3, transition: 'opacity 0.3s' }}>
            <div style={{ color: step >= 4 ? 'var(--blue)' : 'var(--text-muted)' }}>4.</div>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Autonomous Action</div>
              
              {step >= 4 && (
                <div style={{ 
                  marginTop: 8, padding: 12, borderRadius: 6, 
                  background: autoDecision === 'auto_execute' ? 'rgba(0,255,136,0.1)' : 
                              autoDecision === 'ask_user' ? 'rgba(255,193,7,0.1)' : 'rgba(255,51,102,0.1)',
                  border: `1px solid ${autoDecision === 'auto_execute' ? 'var(--green)' : autoDecision === 'ask_user' ? 'var(--yellow)' : 'var(--red)'}`
                }}>
                  {autoDecision === 'auto_execute' && (
                    <>
                      <div style={{ color: 'var(--green)', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        ✅ Auto-Execute Reroute
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        System bypassed human approval due to high confidence ({confPct}%) {domain.name === 'Medical' ? 'and critical Medical domain policy' : ''}.<br/>
                        <strong style={{ color: '#fff' }}>Action:</strong> Fetched alternate routes, optimized for time & CO₂, and applied best route.
                      </div>
                    </>
                  )}

                  {autoDecision === 'ask_user' && (
                    <>
                      <div style={{ color: 'var(--yellow)', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        ⚠️ User Approval Required
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                        Medium confidence ({confPct}%). AI suggests rerouting but requires human validation to proceed.
                      </div>
                      {!actionTaken ? (
                         <button 
                         className="btn btn-primary" 
                         style={{ width: '100%', padding: '6px' }}
                         onClick={() => setActionTaken(true)}
                       >
                         Approve Reroute
                       </button>
                      ) : (
                        <div style={{ color: 'var(--green)', fontSize: 11, textAlign: 'center' }}>
                          ✅ Approved & Applied
                        </div>
                      )}
                    </>
                  )}

                  {autoDecision === 'alert' && (
                    <>
                      <div style={{ color: 'var(--red)', fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
                        🚨 Alert Only
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Low confidence ({confPct}%). Auto-execution disabled. Situation escalated to logistics monitoring team.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
