import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ChevronRight } from 'lucide-react';

export default function VerdictCard({ result }) {
  if (!result) return null;

  const { verdict, summary, matches } = result;

  const config = {
    safe: {
      className: 'safe',
      icon: <CheckCircle2 size={26} color="#10B981" />,
      title: 'SAFE — PASSED',
      badgeColor: '#10B981'
    },
    warning: {
      className: 'warning',
      icon: <AlertTriangle size={26} color="#F59E0B" />,
      title: 'WARNING — MODERATE RISK',
      badgeColor: '#F59E0B'
    },
    danger: {
      className: 'danger',
      icon: <AlertOctagon size={26} color="#EF4444" />,
      title: 'DANGER — CONFLICT FOUND',
      badgeColor: '#EF4444'
    }
  }[verdict] || {
    className: 'safe',
    icon: <CheckCircle2 size={26} color="#10B981" />,
    title: 'ANALYSIS COMPLETE',
    badgeColor: '#10B981'
  };

  return (
    <div className={`verdict-card ${config.className}`}>
      <div className="verdict-header">
        <div className="verdict-badge">
          {config.icon}
          <span>{config.title}</span>
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
          {matches.length} Flagged
        </span>
      </div>

      <div className="verdict-message">
        {summary}
      </div>

      {matches && matches.length > 0 && (
        <div className="flagged-items-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Info size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ingredient Breakdown
            </span>
          </div>

          {matches.map((item, idx) => (
            <div key={idx} className={`flagged-item ${item.severity}`}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {item.canonical}
                  </strong>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    background: item.severity === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', 
                    color: item.severity === 'danger' ? '#B91C1C' : '#B45309',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    {item.type.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.explanation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
