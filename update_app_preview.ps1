$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx..."

$appTsxCode = @"
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import './index.css'; // Make sure Tailwind or your styles are loaded

type AppState = 'WELCOME' | 'THEME_SELECT' | 'COUNTDOWN' | 'PREVIEW' | 'PROCESSING' | 'FINAL';

const THEMES = [
  'AI Cartoon', 'Anime', 'Pixar', 'Superhero', 'Royal King', 'Royal Queen',
  'Business Portrait', 'Wedding', 'Festival', 'Luxury', 'Cyberpunk', 'Hollywood',
  'Bollywood', 'Fantasy', 'Vintage', 'Kids Theme', 'Pet Theme', 'Neon', 'Space'
];

const FRAMES = [
  { name: 'None', style: {} },
  { name: 'Wedding', style: { border: '15px solid #ffd700', borderRadius: '20px', padding: '10px', backgroundColor: '#fff8dc' } },
  { name: 'Garden', style: { border: '15px solid #2e8b57', borderRadius: '10px', padding: '10px', backgroundColor: '#e0ffff' } },
  { name: 'Ice Space', style: { border: '15px solid #00ffff', borderRadius: '5px', padding: '5px', backgroundColor: '#f0f8ff' } },
  { name: 'Politicians', style: { border: '15px solid #000080', borderRadius: '0px', padding: '15px', backgroundColor: '#f5f5f5' } },
  { name: 'Neon', style: { border: '10px solid #ff1493', boxShadow: '0 0 20px #ff1493', padding: '10px' } },
  { name: 'Vintage', style: { border: '20px solid #8b4513', borderRadius: '2px', filter: 'sepia(0.5)' } }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(3);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>('');
  
  // New State for Preview features
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [enhancements, setEnhancements] = useState({
    skinSmoothing: false,
    colorCorrection: false,
    lighting: false,
    blurBackground: false
  });

  const webcamRef = useRef<Webcam>(null);

  // Handle Countdown
  useEffect(() => {
    if (appState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        capture();
      }
    }
  }, [appState, countdown]);

  // Handle API Processing
  useEffect(() => {
    if (appState === 'PROCESSING') {
      const processImage = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/photos/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: imageSrc, theme: selectedTheme })
          });
          if (!response.ok) throw new Error('API Error');
          const data = await response.json();
          if (data.message) { setAiMessage(data.message); }
          setAppState('FINAL');
        } catch (error) {
          console.error("Failed to process image:", error);
          setAiMessage('Failed to connect to Gemini API. Check your connection!');
          setAppState('FINAL'); // Fallback
        }
      };
      processImage();
    }
  }, [appState, imageSrc, selectedTheme]);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    setImageSrc(image);
    setAppState('PREVIEW'); // Go to Preview instead of Processing
  }, [webcamRef]);

  const handleStart = () => {
    setAppState('THEME_SELECT');
  };

  const selectTheme = (theme: string) => {
    setSelectedTheme(theme);
    setCountdown(3);
    setAppState('COUNTDOWN');
  };

  const toggleEnhancement = (key: keyof typeof enhancements) => {
    setEnhancements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyAndGenerate = () => {
    setAppState('PROCESSING');
  };

  const resetSession = () => {
    setImageSrc(null);
    setAiMessage('');
    setSelectedFrame(FRAMES[0]);
    setEnhancements({ skinSmoothing: false, colorCorrection: false, lighting: false, blurBackground: false });
    setAppState('WELCOME');
  };

  // Compute CSS filters based on toggles
  const getFilterStyle = () => {
    let filters = [];
    if (enhancements.skinSmoothing) filters.push('blur(1px) contrast(0.95) brightness(1.05)');
    if (enhancements.colorCorrection) filters.push('saturate(1.4) contrast(1.1)');
    if (enhancements.lighting) filters.push('brightness(1.2) contrast(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.3))');
    if (enhancements.blurBackground) filters.push('opacity(0.9)'); // Mock for background blur
    
    // Add Vintage sepia if that frame is selected
    if (selectedFrame.name === 'Vintage') filters.push('sepia(0.6) contrast(1.2)');

    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif' }}>
      
      {/* WELCOME SCREEN */}
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s ease-in' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', background: 'linear-gradient(to right, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
            Next-Gen AI Photo Booth
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '40px' }}>Step in, strike a pose, and let AI transform your world.</p>
          <button onClick={handleStart} style={{ padding: '15px 40px', fontSize: '1.5rem', borderRadius: '50px', backgroundColor: '#f4f4f5', color: '#09090b', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 20px rgba(255,255,255,0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Tap to Start
          </button>
        </div>
      )}

      {/* THEME SELECTION */}
      {appState === 'THEME_SELECT' && (
        <div style={{ width: '90%', maxWidth: '1200px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Choose Your Universe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {THEMES.map(theme => (
              <button key={theme} onClick={() => selectTheme(theme)} style={{ padding: '20px', borderRadius: '15px', backgroundColor: '#18181b', border: '1px solid #27272a', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#27272a'; e.currentTarget.style.borderColor = '#8b5cf6'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#18181b'; e.currentTarget.style.borderColor = '#27272a'; }}>
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COUNTDOWN / CAPTURE */}
      {appState === 'COUNTDOWN' && (
        <div style={{ position: 'relative', width: '80%', maxWidth: '800px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)' }}>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', display: 'block' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '8rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>{countdown}</span>
          </div>
        </div>
      )}

      {/* PREVIEW & ENHANCEMENTS SCREEN */}
      {appState === 'PREVIEW' && (
        <div style={{ display: 'flex', width: '90%', maxWidth: '1200px', gap: '30px', animation: 'fadeIn 0.5s' }}>
          
          {/* Sidebar */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#18181b', padding: '20px', borderRadius: '20px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: 0, color: '#ec4899' }}>1. Select Frame</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {FRAMES.map(frame => (
                <button key={frame.name} onClick={() => setSelectedFrame(frame)} style={{ padding: '10px', backgroundColor: selectedFrame.name === frame.name ? '#ec4899' : '#27272a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
                  {frame.name}
                </button>
              ))}
            </div>

            <h3 style={{ margin: 0, marginTop: '20px', color: '#8b5cf6' }}>2. AI Enhancements</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enhancements.skinSmoothing} onChange={() => toggleEnhancement('skinSmoothing')} style={{ width: '20px', height: '20px' }} />
              ✨ Skin Smoothing
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enhancements.colorCorrection} onChange={() => toggleEnhancement('colorCorrection')} style={{ width: '20px', height: '20px' }} />
              🎨 Color Correction
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enhancements.lighting} onChange={() => toggleEnhancement('lighting')} style={{ width: '20px', height: '20px' }} />
              💡 Lighting Enhance
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={enhancements.blurBackground} onChange={() => toggleEnhancement('blurBackground')} style={{ width: '20px', height: '20px' }} />
              🌫️ Blur Background
            </label>

            <div style={{ flexGrow: 1 }}></div>
            <button onClick={applyAndGenerate} style={{ padding: '15px', backgroundColor: '#f4f4f5', color: '#09090b', fontWeight: 'bold', fontSize: '1.2rem', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
              Apply & Generate 🚀
            </button>
          </div>

          {/* Image Preview Window */}
          <div style={{ flex: '2', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', padding: '20px' }}>
            <div style={{ ...selectedFrame.style, display: 'inline-block', transition: 'all 0.3s ease' }}>
              <img src={imageSrc as string} alt="Preview" style={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', filter: getFilterStyle(), transition: 'filter 0.3s ease', borderRadius: '5px' }} />
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING */}
      {appState === 'PROCESSING' && (
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '60px', height: '60px', border: '6px solid #27272a', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2>Analyzing with Gemini...</h2>
          <p style={{ color: '#a1a1aa' }}>Applying Theme: {selectedTheme}</p>
        </div>
      )}

      {/* FINAL SCREEN */}
      {appState === 'FINAL' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', animation: 'fadeIn 1s' }}>
          <h2 style={{ fontSize: '3rem', color: '#10b981' }}>Masterpiece Ready!</h2>
          
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* The finalized framed image */}
            <div style={{ ...selectedFrame.style, display: 'inline-block' }}>
              <img src={imageSrc as string} alt="Final" style={{ maxWidth: '400px', borderRadius: '5px', filter: getFilterStyle() }} />
            </div>
            
            {/* AI Text Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {aiMessage && (
                <div style={{ padding: '20px', backgroundColor: 'rgba(112, 0, 255, 0.2)', border: '2px solid #7000FF', borderRadius: '15px', color: '#e4e4e7', fontSize: '1.2rem', maxWidth: '350px', lineHeight: '1.5', fontStyle: 'italic', textAlign: 'left' }}>
                  ✨ {aiMessage}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}>Print 🖨️</button>
                <button style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', cursor: 'pointer' }}>Share 📱</button>
              </div>
            </div>
          </div>

          <button onClick={resetSession} style={{ marginTop: '20px', padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer' }}>
            Start New Session
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
"@
Set-Content -Path "c:\Photo\booth-app\src\App.tsx" -Value $appTsxCode

Write-Host "App.tsx Rewrite Complete!"
