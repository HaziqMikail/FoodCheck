import React, { useState } from 'react';
import { X, Check, ShieldCheck, HeartPulse, AlertCircle, Edit2 } from 'lucide-react';
import { 
  ALLERGEN_OPTIONS, 
  HEALTH_GOAL_OPTIONS, 
  DIETARY_OPTIONS 
} from '../utils/storage';

export default function OnboardingModal({ isOpen, onClose, currentProfile, onSaveProfile }) {
  if (!isOpen) return null;

  const [allergies, setAllergies] = useState(currentProfile?.allergies || []);
  const [healthGoals, setHealthGoals] = useState(currentProfile?.health_goals || []);
  const [dietary, setDietary] = useState(currentProfile?.dietary_restrictions || []);
  const [customCondition, setCustomCondition] = useState(currentProfile?.custom_condition || '');

  const toggleAllergen = (item) => {
    if (allergies.includes(item)) {
      setAllergies(allergies.filter(i => i !== item));
    } else {
      setAllergies([...allergies, item]);
    }
  };

  const toggleHealthGoal = (item) => {
    if (item === 'none') {
      if (healthGoals.includes('none')) {
        setHealthGoals(healthGoals.filter(i => i !== 'none'));
      } else {
        // When choosing None/Custom, add 'none'
        setHealthGoals([...healthGoals, 'none']);
      }
      return;
    }

    if (healthGoals.includes(item)) {
      setHealthGoals(healthGoals.filter(i => i !== item));
    } else {
      setHealthGoals([...healthGoals, item]);
    }
  };

  const toggleDietary = (item) => {
    if (dietary.includes(item)) {
      setDietary(dietary.filter(i => i !== item));
    } else {
      setDietary([...dietary, item]);
    }
  };

  const handleSave = () => {
    const updated = {
      ...currentProfile,
      allergies,
      health_goals: healthGoals,
      dietary_restrictions: dietary,
      custom_condition: customCondition.trim(),
      onboarded: true
    };
    onSaveProfile(updated);
    onClose();
  };

  const showCustomConditionInput = healthGoals.includes('none');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              Health & Dietary Preferences
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Saved 100% locally in your browser. Stateless & Private.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '6px', borderRadius: '50%' }}
            aria-label="Close modal"
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
                    type="button"
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleAllergen(opt.id)}
                  >
                    <span>{opt.label}</span>
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
                    type="button"
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleHealthGoal(opt.id)}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>

            {/* Custom condition text input if None / Custom condition is stated */}
            {showCustomConditionInput && (
              <div className="custom-condition-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Edit2 size={13} color="var(--brand-primary)" />
                  <label className="custom-condition-label">
                    Specify custom condition or ingredient to flag:
                  </label>
                </div>
                <input
                  type="text"
                  className="custom-condition-input"
                  placeholder="e.g. Sulfa, Nightshades, Fructose, Corn Syrup..."
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  autoFocus
                />
                <p className="custom-condition-hint">
                  SafeBite will flag any detected ingredient in labels matching your custom keywords.
                </p>
              </div>
            )}
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
                    type="button"
                    className={`toggle-chip ${selected ? 'selected' : ''}`}
                    onClick={() => toggleDietary(opt.id)}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check size={14} color="#0D9488" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
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
            type="button"
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
