import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OnboardingModal from './components/OnboardingModal';
import ScannerSection from './components/ScannerSection';
import VerdictCard from './components/VerdictCard';
import HistoryDrawer from './components/HistoryDrawer';
import { 
  getUserProfile, 
  saveUserProfile, 
  getScanHistory, 
  addScanToHistory, 
  clearScanHistory,
  ALLERGEN_OPTIONS,
  HEALTH_GOAL_OPTIONS
} from './utils/storage';
import { analyzeIngredients } from './utils/rulesEngine';
import { Heart, ShieldCheck, Settings } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState(getUserProfile);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // If user has not onboarded, pop up the onboarding modal
    const current = getUserProfile();
    setProfile(current);
    setHistory(getScanHistory());
    if (!current.onboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSaveProfile = (newProfile) => {
    const saved = saveUserProfile(newProfile);
    setProfile(saved);
    // If there's an existing scan result, re-run analysis against updated preferences
    if (scanResult?.rawText) {
      const updatedVerdict = analyzeIngredients(scanResult.rawText, saved);
      setScanResult({ ...updatedVerdict, rawText: scanResult.rawText });
    }
  };

  const handleAnalyze = (rawText) => {
    setIsAnalyzing(true);
    // Slight simulated processing delay for smooth UI feedback
    setTimeout(() => {
      const result = analyzeIngredients(rawText, profile);
      const enrichedResult = { ...result, rawText };
      setScanResult(enrichedResult);
      const updatedHistory = addScanToHistory({
        verdict: result.verdict,
        matches: result.matches,
        rawText
      });
      setHistory(updatedHistory);
      setIsAnalyzing(false);
    }, 350);
  };

  const handleClearHistory = () => {
    clearScanHistory();
    setHistory([]);
  };

  const handleSelectHistoryScan = (item) => {
    setScanResult(item);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Helper to get labels for active chips in the mini summary
  const getActiveChips = () => {
    const chips = [];
    (profile?.allergies || []).forEach(a => {
      const opt = ALLERGEN_OPTIONS.find(o => o.id === a);
      if (opt) chips.push(`${opt.icon} ${opt.label}`);
    });
    (profile?.health_goals || []).forEach(g => {
      const opt = HEALTH_GOAL_OPTIONS.find(o => o.id === g);
      if (opt) chips.push(`${opt.icon} ${opt.label}`);
    });
    return chips.slice(0, 4); // show top 4
  };

  const activeChips = getActiveChips();

  return (
    <div className="app-container">
      <Header 
        onOpenSettings={() => setShowOnboarding(true)}
        onToggleHistory={() => setShowHistory(prev => !prev)}
        showHistory={showHistory}
        profile={profile}
      />

      <main className="main-content">
        {/* Active Profile Bar */}
        <div className="profile-summary-card">
          <div className="profile-summary-info">
            <div style={{ background: 'var(--brand-light)', padding: '8px', borderRadius: '50%', color: 'var(--brand-primary)' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Active Health Profile
              </div>
              <div className="profile-tag-list">
                {activeChips.length > 0 ? (
                  activeChips.map((chip, idx) => (
                    <span key={idx} className="profile-mini-chip">{chip}</span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    No allergies or restrictions selected
                  </span>
                )}
                {((profile?.allergies?.length || 0) + (profile?.health_goals?.length || 0)) > 4 && (
                  <span className="profile-mini-chip">
                    +{((profile?.allergies?.length || 0) + (profile?.health_goals?.length || 0)) - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowOnboarding(true)}
            style={{ 
              fontSize: '0.78rem', 
              color: 'var(--brand-primary)', 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Settings size={14} />
            Edit
          </button>
        </div>

        {/* History Drawer (if opened) */}
        {showHistory && (
          <HistoryDrawer 
            history={history}
            onClearHistory={handleClearHistory}
            onSelectScan={handleSelectHistoryScan}
          />
        )}

        {/* Input & Scanner Section */}
        <ScannerSection 
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
        />

        {/* Verdict Result Card */}
        {scanResult && (
          <VerdictCard result={scanResult} />
        )}
      </main>

      {/* Onboarding & Settings Modal */}
      <OnboardingModal 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        currentProfile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
