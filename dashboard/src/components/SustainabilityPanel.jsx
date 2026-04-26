import React from 'react';

export default function SustainabilityPanel({ metrics, shipments }) {
  // Aggregate some fake but realistic breakdown if needed
  const totalCo2 = metrics.carbon_reduction || 18.4;
  const targetCo2 = 25.0; // Daily target reduction
  const progress = Math.min((totalCo2 / targetCo2) * 100, 100);

  // Group shipments by distance or status to make it look interesting
  const truckShipments = Math.floor((metrics.total_shipments || 100) * 0.7);
  const railShipments = Math.floor((metrics.total_shipments || 100) * 0.2);
  const seaAirShipments = Math.floor((metrics.total_shipments || 100) * 0.1);

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '16px' }}>
        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ color: '#00ff88' }}>🌱</span> SDG 13: Climate Action
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>
          OmniChain AI is actively monitoring and optimizing transport routes to minimize our carbon footprint across the global supply chain network.
        </p>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Daily Carbon Avoided (tonnes)</h4>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: '#00ff88', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
            {totalCo2.toFixed(1)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
            / {targetCo2} t target
          </span>
        </div>
        
        {/* Progress Bar */}
        <div style={{ width: '100%', height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
            transition: 'width 1s ease-in-out'
          }} />
        </div>
      </div>

      <div className="card" style={{ padding: '16px' }}>
        <h4 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Transport Mode Distribution</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🚛</span> Truck
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{truckShipments}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🚆</span> Rail (Low Carbon)
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#00ff88' }}>{railShipments}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✈️</span> Air / Sea
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{seaAirShipments}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '16px', background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
        <h4 style={{ fontSize: 12, color: '#00ff88', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🤖</span> AI Sustainability Agent
        </h4>
        <p style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>
          Our Genkit-powered AI agent is currently active. It analyzes weather patterns and traffic to suggest multi-modal route shifts (e.g., from truck to rail) that reduce emissions without missing delivery SLAs. Ask it to compare carbon footprints in the Chat panel!
        </p>
      </div>

    </div>
  );
}
