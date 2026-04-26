import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const QUICK_QUESTIONS = [
  'Which shipments are at HIGH risk?',
  'What is the biggest disruption today?',
  'How much CO₂ have we saved?',
  'Which routes are delayed?',
  'Recommend the safest route from LA to NY',
];

export default function ChatPanel({ shipments, metrics }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hi! I\'m **OmniChain AI**. Ask me anything about your supply chain — current risks, route recommendations, CO₂ savings, or disruption analysis.',
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg = { role: 'user', text: q, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/chat`, {
        query: q,
        context: {
          shipment_count: shipments.length,
          high_risk: metrics?.high_risk || 0,
          medium_risk: metrics?.medium_risk || 0,
          total: metrics?.total_shipments || 0,
          delayed: metrics?.delayed_count || 0,
          carbon_saved: metrics?.carbon_reduction || 18.4,
          cost_saved: metrics?.cost_savings || 127500,
          sample_shipments: shipments.slice(0, 10).map(s => ({
            id: s.shipment_id,
            from: s.current_location,
            to: s.destination,
            status: s.status,
            risk: s.risk_level,
          })),
        },
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response, ts: new Date() }]);
    } catch (err) {
      const errMsg = err.response?.data;
      const text = errMsg?.quota_exceeded
        ? '⚡ Gemini quota exceeded. I\'ll be back shortly! In the meantime, check the Decision panel for AI analysis.'
        : `Sorry, I encountered an error: ${err.message}`;
      setMessages(prev => [...prev, { role: 'assistant', text, ts: new Date(), error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderText = (text) => {
    // Simple markdown bold
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>🧠</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>OmniChain AI Assistant</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Powered by Gemini 2.5 Flash</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#00ff88' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s infinite' }} />
          Online
        </div>
      </div>

      {/* Quick questions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            style={{
              fontSize: 10, padding: '3px 8px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'rgba(0,212,255,0.05)',
              color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 8,
            alignItems: 'flex-start',
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, marginTop: 2,
              }}>🧠</div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,247,0.2))'
                : msg.error ? 'rgba(255,51,102,0.08)' : 'var(--bg-card)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.3)' : msg.error ? 'rgba(255,51,102,0.2)' : 'var(--border)'}`,
              fontSize: 12,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}>
              <div dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                {msg.ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, marginTop: 2,
              }}>👤</div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            }}>🧠</div>
            <div style={{
              padding: '10px 14px', borderRadius: '16px 16px 16px 4px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analyzing with Gemini...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', gap: 8, marginTop: 12, paddingTop: 10,
        borderTop: '1px solid var(--border)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about shipments, risks, routes..."
          style={{
            flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 12,
            color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn btn-primary"
          style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
