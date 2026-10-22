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
  HEALTH_GOAL_OPTIONS,
  DIETARY_OPTIONS
} from './utils/storage';
import { analyzeIngredients } from './utils/rulesEngine';
import { ShieldCheck, Settings, Sparkles, CheckCircle, Smartphone, Lock } from 'lucide-react';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get clean labels for active chips in the mini summary
  const getActiveChips = () => {
    const chips = [];
    (profile?.allergies || []).forEach(a => {
      const opt = ALLERGEN_OPTIONS.find(o => o.id === a);
      if (opt) chips.push(opt.label);
    });
    (profile?.health_goals || []).forEach(g => {
      if (g === 'none') {
        if (!chips.includes('No Specific Condition') && !profile?.custom_condition) {
          chips.push('No Preset Condition');
        }
      } else {
        const opt = HEALTH_GOAL_OPTIONS.find(o => o.id === g);
        if (opt) chips.push(opt.label);
      }
    });
    (profile?.dietary_restrictions || []).forEach(d => {
      const opt = DIETARY_OPTIONS.find(o => o.id === d);
      if (opt) chips.push(opt.label);
    });
    if (profile?.custom_condition?.trim()) {
      chips.push(`Custom: ${profile.custom_condition.trim()}`);
    }
    return chips;
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
        <div className="main-dashboard-grid">
          {/* Left Column: Health Profile + Input & Scanner */}
          <div className="dashboard-col dashboard-col-left">
            {/* Active Profile Bar */}
            <div className="profile-summary-card">
              <div className="profile-summary-info">
                <div className="profile-avatar-icon">
                  <ShieldCheck size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="profile-summary-header">
                    <span className="profile-summary-title">Active Health Profile</span>
                    <span className="profile-count-badge">
                      {activeChips.length} active
                    </span>
                  </div>
                  <div className="profile-tag-list">
                    {activeChips.length > 0 ? (
                      activeChips.slice(0, 5).map((chip, idx) => (
                        <span key={idx} className="profile-mini-chip">{chip}</span>
                      ))
                    ) : (
                      <span className="profile-empty-hint">
                        No allergies or conditions configured
                      </span>
                    )}
                    {activeChips.length > 5 && (
                      <span className="profile-mini-chip more-tag">
                        +{activeChips.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                className="profile-edit-btn"
                onClick={() => setShowOnboarding(true)}
                title="Edit Health Profile"
              >
                <Settings size={14} />
                <span>Edit</span>
              </button>
            </div>

            {/* Input & Scanner Section */}
            <ScannerSection 
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              isModalOpen={showOnboarding || showHistory}
            />

            {/* Mobile History View (only rendered on mobile when showHistory is toggled) */}
            <div className="mobile-only-history">
              {showHistory && (
                <HistoryDrawer 
                  history={history}
                  onClearHistory={handleClearHistory}
                  onSelectScan={handleSelectHistoryScan}
                />
              )}
            </div>
          </div>

          {/* Right Column: Verdict Results & Scan History (Desktop/Tablet) */}
          <div className="dashboard-col dashboard-col-right">
            {/* Scan Verdict Card */}
            {scanResult ? (
              <VerdictCard result={scanResult} />
            ) : (
              <div className="ready-scan-card">
                <div className="ready-scan-icon-wrap">
                  <Sparkles size={28} color="var(--brand-primary)" />
                </div>
                <h3 className="ready-scan-title">Ready for Your Next Label</h3>
                <p className="ready-scan-desc">
                  Choose a quick test preset on the left, scan with your camera, or upload a package photo to detect allergen risks instantly.
                </p>
                <div className="ready-features-list">
                  <div className="ready-feature-item">
                    <CheckCircle size={15} color="var(--safe-primary)" />
                    <span>Stateless analysis runs directly in your browser</span>
                  </div>
                  <div className="ready-feature-item">
                    <CheckCircle size={15} color="var(--safe-primary)" />
                    <span>Matches English & Malay bilingual ingredient aliases</span>
                  </div>
                  <div className="ready-feature-item">
                    <Lock size={15} color="var(--safe-primary)" />
                    <span>Zero data stored on remote servers — 100% private</span>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Persistent History Section */}
            <div className="desktop-history-wrap">
              <HistoryDrawer 
                history={history}
                onClearHistory={handleClearHistory}
                onSelectScan={handleSelectHistoryScan}
              />
            </div>
          </div>
        </div>
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
