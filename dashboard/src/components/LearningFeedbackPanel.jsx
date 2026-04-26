import { useState, useEffect } from 'react';

export default function LearningFeedbackPanel({ shipment }) {
  const [learningStep, setLearningStep] = useState(0);

  useEffect(() => {
    setLearningStep(0);
    if (shipment) {
      // Simulate the feedback loop progression
      const timers = [
        setTimeout(() => setLearningStep(1), 600),  // Store outcome
        setTimeout(() => setLearningStep(2), 1400), // Compare error
        setTimeout(() => setLearningStep(3), 2200), // Update Model Weights
        setTimeout(() => setLearningStep(4), 3000)  // Reward (RL)
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [shipment?.shipment_id]);

  if (!shipment) {
    return (
      <div className="decision-detail">
        <div className="empty" style={{ padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔄</div>
          <div>Select a shipment to view Learning Feedback</div>
        </div>
      </div>
    );
  }

  // Generate deterministic mock feedback values based on shipment ID
  const hash = shipment.shipment_id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const predictedDelay = ((hash % 10) + 1) * 0.5; // e.g. 0.5 to 5.0
  const actualDelay = Math.max(0, predictedDelay + ((hash % 5) - 2) * 0.3); // add some error
  const errorValue = (predictedDelay - actualDelay).toFixed(2);
  const timeSaved = Math.max(0, ((hash % 8) * 0.4)).toFixed(1);
  const co2Reduced = ((hash % 15) * 0.1).toFixed(2);
  const weightAdjust = (Math.abs(errorValue) * 0.05).toFixed(4);

  return (
    <div className="decision-detail" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Grid Background for "AI Processing" feel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(0, 204, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 204, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px', zIndex: 0, pointerEvents: 'none',
        opacity: learningStep > 0 ? 1 : 0.2, transition: 'opacity 1s'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontWeight: 700, fontSize: 15 }}>
              Continuous Learning
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              True AI Feedback Loop
            </div>
          </div>
          <span className="status-badge delivered" style={{ border: '1px solid var(--green)', color: 'var(--green)' }}>
            🔄 ONLINE LEARNING
          </span>
        </div>

        {/* Prediction -> Action -> Result */}
        <div className="detail-section" style={{ marginTop: 16 }}>
          <div className="detail-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span>📊 Delivery Outcome: </span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{shipment.shipment_id}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, opacity: learningStep >= 1 ? 1 : 0.2, transition: 'opacity 0.4s' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 6, flex: 1, marginRight: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Predicted Delay</div>
              <div style={{ fontSize: 16, color: 'var(--blue)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{predictedDelay.toFixed(1)}h</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 6, flex: 1, marginLeft: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actual Delay</div>
              <div style={{ fontSize: 16, color: 'var(--yellow)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>{actualDelay.toFixed(1)}h</div>
            </div>
          </div>
        </div>

        {/* Comparison & Error */}
        <div className="detail-section" style={{ opacity: learningStep >= 2 ? 1 : 0.2, transition: 'opacity 0.4s' }}>
          <div className="detail-label">⚖️ Error Calculation</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Error = Predicted - Actual
            </div>
            <div style={{ 
              fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 'bold',
              color: Math.abs(errorValue) > 1.0 ? 'var(--red)' : 'var(--green)'
            }}>
              Δ {errorValue} hrs
            </div>
          </div>
        </div>

        {/* Model Update (Online Learning) */}
        <div className="detail-section" style={{ opacity: learningStep >= 3 ? 1 : 0.2, transition: 'opacity 0.4s' }}>
          <div className="detail-label">⚙️ BigQuery ML Model Update</div>
          <div style={{ background: 'rgba(0, 204, 255, 0.1)', border: '1px solid var(--blue)', padding: 10, borderRadius: 6, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2, display: learningStep === 3 ? 'block' : 'none' }}></div>
              <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                {learningStep === 3 ? 'Adjusting weights...' : 'Weights Adjusted'}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              &gt; UPDATE MODEL \`risk_prediction_model\`<br/>
              &gt; SET learning_rate = 0.01<br/>
              &gt; APPLIED WEIGHT DELTA: {learningStep >= 4 ? `±${weightAdjust}` : '...'}
            </div>
          </div>
        </div>

        {/* Reinforcement Learning Reward */}
        <div className="detail-section" style={{ opacity: learningStep >= 4 ? 1 : 0.2, transition: 'opacity 0.4s', borderBottom: 'none' }}>
          <div className="detail-label">🎯 Reinforcement Learning Reward</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,255,136,0.05)', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Time Saved Reward</span>
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>+{timeSaved} pts</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,255,136,0.05)', padding: '8px', borderRadius: '4px' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>CO₂ Reduced Reward</span>
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>+{co2Reduced} pts</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Model Accuracy Improved
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
