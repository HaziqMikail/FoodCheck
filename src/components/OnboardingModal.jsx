import React, { useState } from 'react';
import { X, Check, ShieldCheck, HeartPulse, Sparkles, AlertCircle } from 'lucide-react';
import { 
  ALLERGEN_OPTIONS, 
  HEALTH_GOAL_OPTIONS, 
  DIETARY_OPTIONS, 
  ADDITIVE_OPTIONS 
} from '../utils/storage';

export default function OnboardingModal({ isOpen, onClose, currentProfile, onSaveProfile }) {
  if (!isOpen) return null;

  const [allergies, setAllergies] = useState(currentProfile?.allergies || []);
  const [healthGoals, setHealthGoals] = useState(currentProfile?.health_goals || []);
  const [dietary, setDietary] = useState(currentProfile?.dietary_restrictions || []);
  const [additives, setAdditives] = useState(currentProfile?.flagged_additives || []);

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    const updated = {
      ...currentProfile,
      allergies,
      health_goals: healthGoals,
      dietary_restrictions: dietary,
      flagged_additives: additives,
      onboarded: true
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              What are your allergies or health goals?
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Saved 100% locally in your browser. No account or password needed.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Allergens Group */}
          <div className="preference-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} color="#EF4444" />
              <span className="preference-group-title">Critical Food Allergens</span>
            </div>
            <div className="toggle-grid">
              {ALLERGEN_OPTIONS.map(opt => {
                const selected = allergies.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleItem(allergies, setAllergies, opt.id)}
                  >
                    <span>{opt.icon} {opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Conditions */}
          <div className="preference-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HeartPulse size={15} color="#0D9488" />
              <span className="preference-group-title">Health Goals & Conditions</span>
            </div>
            <div className="toggle-grid">
              {HEALTH_GOAL_OPTIONS.map(opt => {
                const selected = healthGoals.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleItem(healthGoals, setHealthGoals, opt.id)}
                  >
                    <span>{opt.icon} {opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Lifestyle */}
          <div className="preference-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="#10B981" />
              <span className="preference-group-title">Dietary & Lifestyle Rules</span>
            </div>
            <div className="toggle-grid">
              {DIETARY_OPTIONS.map(opt => {
                const selected = dietary.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleItem(dietary, setDietary, opt.id)}
                  >
                    <span>{opt.icon} {opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blacklisted Additives */}
          <div className="preference-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} color="#F59E0B" />
              <span className="preference-group-title">Additives & E-Numbers</span>
            </div>
            <div className="toggle-grid">
              {ADDITIVE_OPTIONS.map(opt => {
                const selected = additives.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleItem(additives, setAdditives, opt.id)}
                  >
                    <span>{opt.icon} {opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            Cancel
          </button>
          <button
            className="btn-primary-action"
            onClick={handleSave}
            style={{ width: 'auto', padding: '10px 22px', fontSize: '0.9rem' }}
          >
            <Check size={16} />
            Save to Device
          </button>
        </div>
      </div>
    </div>
  );
}
