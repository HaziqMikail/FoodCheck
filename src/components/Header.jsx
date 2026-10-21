import React from 'react';
import { ShieldAlert, Sliders, History } from 'lucide-react';

export default function Header({ onOpenSettings, onToggleHistory, showHistory, profile }) {
  const activeRestrictionsCount = 
    (profile?.allergies?.length || 0) + 
    (profile?.health_goals?.length || 0) + 
    (profile?.dietary_restrictions?.length || 0) + 
    (profile?.flagged_additives?.length || 0);

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <ShieldAlert size={22} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-title">FoodCheck</span>
            <span className="brand-badge">Stateless</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="header-action-btn"
          onClick={onToggleHistory}
          title="View Scan History"
          style={{ background: showHistory ? 'rgba(255,255,255,0.32)' : undefined }}
        >
          <History size={16} />
        </button>

        <button 
          className="header-action-btn"
          onClick={onOpenSettings}
          title="Configure Health Profile"
        >
          <Sliders size={16} />
          <span>Profile ({activeRestrictionsCount})</span>
        </button>
      </div>
    </header>
  );
}
