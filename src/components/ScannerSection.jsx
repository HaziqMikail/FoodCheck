import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, Edit3, Play, Square, RefreshCw, Aperture, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { captureVideoFrame, fileToDataUrl } from '../utils/imageUtils';
import { extractIngredientsFromImage, getActiveAiConfig } from '../utils/aiVision';

export default function ScannerSection({ onAnalyze, isAnalyzing, isModalOpen }) {
  const [activeTab, setActiveTab] = useState('text'); // 'camera' | 'upload' | 'text'
  const [inputText, setInputText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiSuccessBadge, setAiSuccessBadge] = useState('');

  const [aiConfig] = useState(getActiveAiConfig);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    if (cameraActive || isStartingCamera) return;
    setCameraError('');
    setAiError('');
    setIsStartingCamera(true);

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
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsStartingCamera(false);
  };

  // Automatic camera lifecycle:
  // 1. Open camera automatically when opening 'camera' tab and modal is NOT open.
  // 2. Close camera automatically when switching away from 'camera' tab or when modal/menu opens.
  // 3. Close camera when browser app is minimized or hidden on mobile.
  useEffect(() => {
    if (activeTab === 'camera' && !isModalOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      } else if (activeTab === 'camera' && !isModalOpen) {
        startCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [activeTab, isModalOpen]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAiError('');
  };

  // CV: Snap frame from live video and send to AI Vision
  const handleSnapAndScan = async () => {
    if (!videoRef.current || !cameraActive) return;

    setIsAiProcessing(true);
    setAiStatus('Capturing live video frame with Computer Vision...');
    setAiError('');
    setAiSuccessBadge('');

    try {
      const captured = await captureVideoFrame(videoRef.current);
      setAiStatus(`Reading packaging with ${aiConfig.provider === 'openai' ? 'OpenAI GPT-4o' : 'Google Gemini AI'}...`);

      const result = await extractIngredientsFromImage(captured.base64Data, captured.mimeType);

      if (result.success && result.ingredientsText) {
        setInputText(result.ingredientsText);
        setAiSuccessBadge(`AI Vision (${result.provider}) successfully extracted ingredients!`);
        // Trigger health analysis immediately
        onAnalyze(result.ingredientsText);
      } else {
        setAiError(result.message || 'Could not extract ingredients. Please verify packaging is clearly visible.');
      }
    } catch (err) {
      console.error('Frame capture / AI Vision failure:', err);
      setAiError(err.message || 'Failed to capture and process frame.');
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  // CV: Handle image upload, compress, and run AI Vision
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiError('');
    setAiSuccessBadge('');
    setIsAiProcessing(true);
    setAiStatus('Optimizing image with Computer Vision...');

    try {
      const processed = await fileToDataUrl(file);
      setUploadedImage(processed.dataUrl);

      setAiStatus(`Extracting ingredients with ${aiConfig.provider === 'openai' ? 'OpenAI Vision' : 'Google Gemini AI'}...`);
      const result = await extractIngredientsFromImage(processed.base64Data, processed.mimeType);

      if (result.success && result.ingredientsText) {
        setInputText(result.ingredientsText);
        setAiSuccessBadge(`Extracted with ${result.provider}`);
        onAnalyze(result.ingredientsText);
      } else {
        setAiError(result.message || 'Could not extract ingredients from image.');
      }
    } catch (err) {
      console.error('Image processing error:', err);
      setAiError(err.message || 'Failed to process image file.');
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  const handleManualScan = () => {
    if (inputText.trim()) {
      onAnalyze(inputText);
    }
  };

  return (
    <div className="scanner-card">
      {/* Header bar with AI status badge */}
      <div className="scanner-top-bar">
        <span className="scanner-top-title">Ingredient Input & Vision Scanner</span>
        {aiConfig.provider && (
          <div className="ai-badge active" style={{ cursor: 'default' }}>
            <Zap size={12} />
            <span>{aiConfig.provider === 'gemini' ? 'Gemini Flash Active' : 'OpenAI Active'}</span>
          </div>
        )}
      </div>

      {/* Mode Tabs */}
      <div className="tab-switcher">
        <button 
          type="button"
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => handleTabChange('text')}
        >
          <Edit3 size={16} />
          <span>Text Input</span>
        </button>

        <button 
          type="button"
          className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
          onClick={() => handleTabChange('camera')}
        >
          <Camera size={16} />
          <span>Live Camera</span>
        </button>

        <button 
          type="button"
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => handleTabChange('upload')}
        >
          <UploadCloud size={16} />
          <span>Upload Label</span>
        </button>
      </div>

      {/* Status Notifications */}
      {isAiProcessing && (
        <div className="ai-processing-banner">
          <RefreshCw size={16} className="spin" />
          <span>{aiStatus}</span>
        </div>
      )}

      {aiSuccessBadge && (
        <div className="ai-success-banner">
          <CheckCircle2 size={16} color="var(--safe-primary)" />
          <span>{aiSuccessBadge}</span>
        </div>
      )}

      {aiError && (
        <div className="ai-error-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <AlertCircle size={16} color="var(--danger-primary)" />
            <span>{aiError}</span>
          </div>
          {!aiConfig.provider && (
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--brand-primary)',
                background: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              Add Key
            </button>
          )}
        </div>
      )}

      {/* Tab: Camera */}
      {activeTab === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="camera-view-box">
            {cameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="camera-video" />
                <div className="camera-guide-overlay">
                  <div className="scanner-laser" />
                  <span className="camera-guide-text">Align ingredients text within frame</span>
                </div>
              </>
            ) : isStartingCamera ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '28px 16px' }}>
                <RefreshCw size={36} className="spin" style={{ margin: '0 auto 10px', color: 'var(--brand-primary)' }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>Starting live camera stream...</p>
                <p style={{ fontSize: '0.76rem', color: '#9CA3AF', marginTop: '4px' }}>
                  Please grant camera access if prompted.
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px 16px' }}>
                <Camera size={44} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Camera is stopped.</p>
                {cameraError ? (
                  <p style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '6px' }}>{cameraError}</p>
                ) : (
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Click below to start live scanning.
                  </p>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {cameraActive ? (
              <>
                <button 
                  type="button"
                  className="btn-primary-action btn-shutter-snap" 
                  onClick={handleSnapAndScan}
                  disabled={isAiProcessing}
                  style={{ flex: 2, padding: '12px' }}
                >
                  <Aperture size={18} />
                  <span>Snap & Analyze with AI</span>
                </button>

                <button 
                  type="button"
                  className="btn-secondary-action" 
                  onClick={stopCamera}
                  style={{ flex: 1, padding: '12px' }}
                  title="Pause Camera"
                >
                  <Square size={16} />
                  <span>Pause</span>
                </button>
              </>
            ) : (
              <button 
                type="button"
                className="btn-primary-action" 
                onClick={startCamera}
                disabled={isStartingCamera}
                style={{ padding: '12px' }}
              >
                {isStartingCamera ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    <span>Connecting camera...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>Start Camera</span>
                  </>
                )}
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
              <p style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                Click to browse or drop food label photo
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Computer Vision automatically compresses and extracts text with AI
              </p>
            </div>
          </label>

          {uploadedImage && (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '200px', border: '1px solid var(--border-light)' }}>
              <img src={uploadedImage} alt="Label preview" style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
            </div>
          )}
        </div>
      )}

      {/* Tab: Text & Quick Samples */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ingredients Text to Check
          </label>
          {inputText && (
            <button 
              type="button"
              onClick={() => {
                setInputText('');
                setAiSuccessBadge('');
              }}
              style={{ fontSize: '0.74rem', color: 'var(--brand-primary)', fontWeight: 600 }}
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          className="text-input-box"
          placeholder="Extracted or typed ingredients list will appear here (e.g. 'Ingredients: Whole milk, sugar, peanut oil, salt...')"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Main Scan Button */}
      <button 
        type="button"
        className="btn-primary-action"
        onClick={handleManualScan}
        disabled={isAnalyzing || isAiProcessing}
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
