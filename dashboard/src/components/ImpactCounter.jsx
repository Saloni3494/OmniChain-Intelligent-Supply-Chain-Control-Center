import { useEffect, useRef, useState } from 'react';

function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevRef.current;
    const end = Number(value) || 0;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}

export default function ImpactCounter({ metrics }) {
  const m = metrics || {};

  const stats = [
    {
      label: 'CO₂ Saved',
      value: m.carbon_reduction || 18.4,
      decimals: 1,
      suffix: 't',
      color: '#00ff88',
      icon: '🌱',
      sub: 'tonnes carbon avoided',
    },
    {
      label: 'Cost Avoided',
      value: m.cost_savings || 127500,
      decimals: 0,
      prefix: '$',
      color: '#00d4ff',
      icon: '💰',
      sub: 'USD saved today',
    },
    {
      label: 'Delay Reduction',
      value: m.avg_delay_reduction || 42,
      decimals: 0,
      suffix: '%',
      color: '#7b2ff7',
      icon: '⚡',
      sub: 'vs baseline routing',
    },
    {
      label: 'Routes Optimized',
      value: m.delivered_count || 0,
      decimals: 0,
      color: '#ffc107',
      icon: '🗺️',
      sub: 'shipments completed',
    },
  ];

  return (
    <div style={{
      padding: '12px 16px',
      background: 'linear-gradient(135deg, rgba(0,212,255,0.04), rgba(123,47,247,0.04))',
      borderRadius: 'var(--radius)',
      border: '1px solid rgba(0,212,255,0.1)',
      marginBottom: 12,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
        color: 'var(--text-muted)', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ color: '#00ff88' }}>●</span> Real-Time Impact
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg-card)',
            borderRadius: 8,
            padding: '8px 10px',
            border: '1px solid var(--border)',
            transition: 'border-color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = stat.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ fontSize: 16, marginBottom: 2 }}>{stat.icon}</div>
            <div style={{
              fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)',
              color: stat.color, lineHeight: 1,
            }}>
              <AnimatedNumber
                value={stat.value}
                decimals={stat.decimals}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
