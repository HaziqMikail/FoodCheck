import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, Edit3, Play, Square, Sparkles, RefreshCw } from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    name: 'Nestlé Susu Penuh Krim',
    tag: 'Dairy Allergy Test',
    text: 'Bahan-bahan: Pepejal Susu (Susu Lembu), Lemak Susu, Mengandungi Pengemulsi (Lesitin Soya) Sebagai Kondisioner Makanan Yang Dibenarkan. Mengandungi Alergen: Susu, Soya.'
  },
  {
    name: 'Peanut Butter Granola Bar',
    tag: 'Severe Nut Alert',
    text: 'Ingredients: Whole grain rolled oats, roasted peanuts, cane sugar, peanut oil, sea salt, natural flavor, whey powder.'
  },
  {
    name: 'Spicy Instant Ramen',
    tag: 'Sodium & MSG Test',
    text: 'Ingredients: Wheat flour, palm oil, salt, monosodium glutamate (E621), disodium inosinate, hydrolyzed soy protein, tartrazine (E102), sodium carbonate.'
  },
  {
    name: 'Organic Fruit Bites',
    tag: 'Safe / Clean Product',
    text: 'Ingredients: Organic dried apples, organic strawberries, organic banana puree, organic lemon juice concentrate.'
  }
];

export default function ScannerSection({ onAnalyze, isAnalyzing }) {
  const [activeTab, setActiveTab] = useState('text'); // 'camera' | 'upload' | 'text'
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera stream when switching tabs or unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleTabChange = (tab) => {
    if (activeTab === 'camera' && tab !== 'camera') {
      stopCamera();
    }
    setActiveTab(tab);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result);
        // Pre-fill text with a helpful message or simulate label extraction
        if (!inputText) {
          setInputText('Sample extracted label: Wheat flour, milk solids, salt, sugar, soy lecithin.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteScan = () => {
    if (!inputText.trim()) {
      setInputText(SAMPLE_PRESETS[0].text);
      onAnalyze(SAMPLE_PRESETS[0].text);
    } else {
      onAnalyze(inputText);
    }
  };

  return (
    <div className="scanner-card">
      {/* Mode Tabs */}
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => handleTabChange('text')}
        >
          <Edit3 size={16} />
          <span>Quick Test</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => handleTabChange('camera')}
        >
          <Camera size={16} />
          <span>Live Camera</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => handleTabChange('upload')}
        >
          <UploadCloud size={16} />
          <span>Upload Label</span>
        </button>
      </div>

      {/* Tab: Camera */}
      {activeTab === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="camera-view-box">
            {cameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-guide-overlay">
                  <div className="scanner-laser" />
                  <span className="camera-guide-text">Align ingredient text within box</span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                <Camera size={44} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.86rem' }}>Camera preview is currently idle.</p>
                {cameraError && (
                  <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '6px' }}>{cameraError}</p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!cameraActive ? (
              <button 
                className="btn-primary-action" 
                onClick={startCamera}
                style={{ padding: '10px' }}
              >
                <Play size={16} />
                <span>Start Camera Scanner</span>
              </button>
            ) : (
              <button 
                className="btn-primary-action" 
                onClick={stopCamera}
                style={{ background: '#4B5563', padding: '10px' }}
              >
                <Square size={16} />
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab: Upload File */}
      {activeTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label className="upload-dropzone">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              style={{ display: 'none' }} 
            />
            <div className="upload-icon-circle">
              <UploadCloud size={24} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                Click to browse or drop food label photo
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Supports JPG, PNG, WEBP from mobile or desktop
              </p>
            </div>
          </label>

          {uploadedImage && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '180px', border: '1px solid var(--border-light)' }}>
              <img src={uploadedImage} alt="Label preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
            </div>
          )}
        </div>
      )}

      {/* Tab: Text & Quick Samples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Ingredients Text to Check
          </label>
          {inputText && (
            <button 
              onClick={() => setInputText('')}
              style={{ fontSize: '0.74rem', color: 'var(--brand-primary)', fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          className="text-input-box"
          placeholder="Paste or type ingredients list here (e.g., 'Ingredients: Whole milk, sugar, peanut oil, salt, E621...')"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Quick Sample Presets */}
        <div>
          <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Quick Test Presets:
          </span>
          <div className="sample-prompts" style={{ marginTop: '6px' }}>
            {SAMPLE_PRESETS.map((sample, idx) => (
              <button
                key={idx}
                className="sample-chip"
                onClick={() => {
                  setInputText(sample.text);
                  onAnalyze(sample.text);
                }}
              >
                <Sparkles size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                <span>{sample.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scan Button */}
      <button 
        className="btn-primary-action"
        onClick={handleExecuteScan}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? (
          <>
            <RefreshCw size={18} className="spin" />
            <span>Analyzing against health profile...</span>
          </>
        ) : (
          <>
            <Camera size={18} />
            <span>Check Ingredients Now</span>
          </>
        )}
      </button>
    </div>
  );
}
