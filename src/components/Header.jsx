import React from 'react';
import { Sliders } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Header({ onOpenSettings, profile }) {
  const activeRestrictionsCount = 
    (profile?.allergies?.length || 0) + 
    (profile?.health_goals?.filter(g => g !== 'none')?.length || 0) + 
    (profile?.dietary_restrictions?.length || 0) + 
    (profile?.custom_condition?.trim() ? 1 : 0);

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-logo-container">
          <img src={logoImg} alt="SafeBite Logo" className="brand-logo-img" />
        </div>
        <div className="brand-text-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">SafeBite</span>
            <span className="brand-badge">Stateless</span>
          </div>
          <span className="brand-subtext">Food Allergen & Health Scanner</span>
        </div>
      </div>

      <button 
        className="header-action-btn"
        onClick={onOpenSettings}
        title="Configure Health Profile"
      >
        <Sliders size={16} />
        <span>Profile ({activeRestrictionsCount})</span>
      </button>
    </header>
  );
}
