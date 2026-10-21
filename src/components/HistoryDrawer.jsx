import React from 'react';
import { History, Trash2, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function HistoryDrawer({ history, onClearHistory, onSelectScan }) {
  if (!history || history.length === 0) {
    return (
      <div className="history-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={16} color="var(--brand-primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Recent Scans (Local)
            </span>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
          No scans yet. Check an ingredient label above to view your local history!
        </p>
      </div>
    );
  }

  return (
    <div className="history-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={16} color="var(--brand-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Recent Scans ({history.length})
          </span>
        </div>
        <button 
          onClick={onClearHistory}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#EF4444', fontWeight: 600 }}
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((item) => {
          const icon = item.verdict === 'danger' 
            ? <AlertOctagon size={16} color="#EF4444" />
            : item.verdict === 'warning'
            ? <AlertTriangle size={16} color="#F59E0B" />
            : <CheckCircle2 size={16} color="#10B981" />;

          const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

          return (
            <div 
              key={item.id} 
              className="history-item"
              onClick={() => onSelectScan(item)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {icon}
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    {item.verdict.toUpperCase()} — {item.matches?.length || 0} match(es)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.rawText ? item.rawText.substring(0, 40) + '...' : 'Scan result'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {timeStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
