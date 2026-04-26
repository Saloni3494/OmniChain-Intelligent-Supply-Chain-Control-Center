import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FMT = (n) => n?.toLocaleString() || '0';

export default function MetricsDashboard({ metrics }) {
  const m = metrics || {};

  const riskData = [
    { name: 'Low',    value: m.low_risk    || 0, color: '#00ff88' },
    { name: 'Medium', value: m.medium_risk || 0, color: '#ffc107' },
    { name: 'High',   value: m.high_risk   || 0, color: '#ff3366' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'#0d1f2f', border:'1px solid #1a3a54', borderRadius:6, padding:'6px 10px', fontSize:11 }}>
        <strong style={{ color: payload[0].payload.color }}>{payload[0].name}</strong>: {payload[0].value}
      </div>
    );
  };

  return (
    <div>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="m-label">Active</div>
          <div className="m-value blue">{FMT(m.total_shipments)}</div>
          <div className="m-sub">Shipments</div>
        </div>
        <div className="metric-card">
          <div className="m-label">High Risk</div>
          <div className="m-value red">{FMT(m.high_risk)}</div>
          <div className="m-sub">Critical</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Delayed</div>
          <div className="m-value yellow">{FMT(m.delayed_count)}</div>
          <div className="m-sub">In Backlog</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Delivered</div>
          <div className="m-value green">{FMT(m.delivered_count)}</div>
          <div className="m-sub">Completed</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Delay Saved</div>
          <div className="m-value green">{m.avg_delay_reduction || 42}%</div>
          <div className="m-sub">vs Baseline</div>
        </div>
        <div className="metric-card">
          <div className="m-label">Cost Saved</div>
          <div className="m-value blue">${FMT(m.cost_savings)}</div>
          <div className="m-sub">This Hour</div>
        </div>
        <div className="metric-card" style={{ gridColumn:'1/-1' }}>
          <div className="m-label">CO₂ Reduction</div>
          <div className="m-value green">{m.carbon_reduction || 18.4}t</div>
          <div className="m-sub">Carbon saved today</div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      <div className="chart-container">
        <div className="panel-title" style={{ marginBottom:8 }}>
          <span className="icon">📊</span> Risk Distribution
        </div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={riskData} margin={{ top:0, right:0, bottom:0, left:-20 }}>
            <XAxis dataKey="name" tick={{ fill:'#3a6a8a', fontSize:10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#3a6a8a', fontSize:10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip/>} />
            <Bar dataKey="value" radius={[3,3,0,0]}>
              {riskData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Confidence */}
      <div style={{ padding:'0 16px 16px' }}>
        <div className="panel-title" style={{ marginBottom:8 }}>
          <span className="icon">🤖</span> AI Confidence
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontSize:11, color:'var(--text-muted)' }}>Avg. model confidence</span>
          <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--blue)' }}>
            {Math.round((m.avg_confidence || 0) * 100)}%
          </span>
        </div>
        <div className="confidence-bar" style={{ height:6 }}>
          <div className="confidence-fill" style={{ width:`${Math.round((m.avg_confidence || 0) * 100)}%` }}/>
        </div>
      </div>
    </div>
  );
}
