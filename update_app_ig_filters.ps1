$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with 20+ Instagram Filters..."

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none' },
  { name: 'Clarendon', css: 'contrast(1.2) saturate(1.35)' },
  { name: 'Gingham', css: 'brightness(1.05) hue-rotate(-10deg)' },
  { name: 'Moon', css: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { name: 'Lark', css: 'contrast(0.9) saturate(1.1) brightness(1.1)' },
  { name: 'Reyes', css: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)' },
  { name: 'Juno', css: 'saturate(1.4) contrast(1.1) hue-rotate(-5deg)' },
  { name: 'Slumber', css: 'saturate(0.66) brightness(1.05)' },
  { name: 'Crema', css: 'sepia(0.5) brightness(1.15) contrast(0.9)' },
  { name: 'Ludwig', css: 'saturate(1.2) contrast(1.05) hue-rotate(5deg)' },
  { name: 'Aden', css: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)' },
  { name: 'Perpetua', css: 'saturate(1.1) brightness(1.1) hue-rotate(15deg)' },
  { name: 'Mayfair', css: 'contrast(1.1) saturate(1.1)' },
  { name: 'Rise', css: 'brightness(1.05) sepia(0.2) contrast(0.9) saturate(0.9)' },
  { name: 'Hudson', css: 'brightness(1.2) contrast(0.9) saturate(1.1)' },
  { name: 'Valencia', css: 'sepia(0.08) brightness(1.08) contrast(1.08)' },
  { name: 'X-Pro II', css: 'sepia(0.3) contrast(1.25) brightness(0.9) saturate(1.3)' },
  { name: 'Sierra', css: 'contrast(0.8) saturate(1.2) sepia(0.15)' },
  { name: 'Willow', css: 'grayscale(0.5) contrast(0.95) brightness(0.9)' },
  { name: 'Lo-Fi', css: 'saturate(1.1) contrast(1.5)' },
  { name: 'Inkwell', css: 'sepia(0.3) contrast(1.1) brightness(1.1) grayscale(1)' },
  { name: 'Hefe', css: 'contrast(1.5) saturate(1.5)' },
  { name: 'Nashville', css: 'sepia(0.2) contrast(1.2) brightness(1.05) saturate(1.2)' },
  { name: 'Pop Art', css: 'saturate(2) contrast(1.3) hue-rotate(45deg)' },
  { name: 'Cyber Neon', css: 'saturate(2) hue-rotate(180deg) contrast(1.5)' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [countdown, setCountdown] = useState<number>(3);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

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

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    setImageSrc(image);
    setAppState('FINAL');
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
    setAppState('COUNTDOWN');
  };

  const resetSession = () => {
    setImageSrc(null);
    setSelectedFilter(FILTERS[0]);
    setAppState('WELCOME');
  };

  return (
    <div style={{ backgroundColor: '#09090b', color: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif' }}>
      
      {/* WELCOME SCREEN */}
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
          <h1 style={{ fontSize: '4.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #ec4899, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
            InstaBooth
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '40px' }}>25+ Studio Quality Filters. Instant Capture.</p>
          <button onClick={() => setAppState('FILTER_SELECT')} style={{ padding: '20px 60px', fontSize: '1.5rem', borderRadius: '50px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
            Open Camera
          </button>
        </div>
      )}

      {/* FILTER SELECT & LIVE PREVIEW */}
      {(appState === 'FILTER_SELECT' || appState === 'COUNTDOWN') && (
        <div style={{ display: 'flex', width: '95%', maxWidth: '1400px', height: '80vh', gap: '30px', alignItems: 'center' }}>
          
          {/* Sidebar - Filter Selection */}
          <div style={{ flex: '1', height: '100%', backgroundColor: '#18181b', borderRadius: '20px', padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#f59e0b', textAlign: 'center' }}>Filters</h2>
            
            <div style={{ overflowY: 'auto', flexGrow: 1, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', paddingRight: '10px' }}>
              {FILTERS.map(f => (
                <button 
                  key={f.name} 
                  onClick={() => setSelectedFilter(f)} 
                  disabled={appState === 'COUNTDOWN'}
                  style={{ 
                    padding: '20px 10px', 
                    backgroundColor: selectedFilter.name === f.name ? '#f59e0b' : '#27272a', 
                    color: selectedFilter.name === f.name ? 'black' : 'white',
                    border: 'none', 
                    borderRadius: '12px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    transform: selectedFilter.name === f.name ? 'scale(1.05)' : 'scale(1)'
                  }}>
                  {f.name}
                </button>
              ))}
            </div>

            {appState === 'FILTER_SELECT' && (
              <button onClick={startCountdown} style={{ marginTop: '20px', padding: '20px', backgroundColor: '#ec4899', color: 'white', fontWeight: 'bold', fontSize: '1.5rem', borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 5px 20px rgba(236, 72, 153, 0.4)' }}>
                📸 Capture
              </button>
            )}
          </div>

          {/* Live Webcam Preview */}
          <div style={{ flex: '3', height: '100%', position: 'relative', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#000', border: '2px solid #27272a' }}>
            <Webcam 
              audio={false} 
              ref={webcamRef} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode: "user" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css, transition: 'filter 0.3s ease' }} 
            />
            
            {/* Filter Name Overlay */}
            <div style={{ position: 'absolute', bottom: '30px', left: '0', width: '100%', textAlign: 'center' }}>
               <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px 30px', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                 {selectedFilter.name}
               </span>
            </div>

            {/* Countdown Overlay */}
            {appState === 'COUNTDOWN' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
                <span style={{ fontSize: '12rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 30px #ec4899' }}>{countdown}</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* FINAL SCREEN */}
      {appState === 'FINAL' && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', animation: 'fadeIn 0.5s' }}>
          <h2 style={{ fontSize: '3rem', color: '#10b981', margin: 0 }}>Got it!</h2>
          
          <div style={{ backgroundColor: 'white', padding: '20px 20px 60px 20px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <img src={imageSrc as string} alt="Final" style={{ maxWidth: '800px', filter: selectedFilter.css, borderRadius: '5px' }} />
            <div style={{ color: 'black', fontSize: '2rem', fontFamily: '"Brush Script MT", cursive', marginTop: '20px' }}>
              InstaBooth - {selectedFilter.name}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
             <button style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Print Photo 🖨️
             </button>
             <button onClick={resetSession} style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Retake
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
'@
Set-Content -Path "c:\Photo\booth-app\src\App.tsx" -Value $appTsxCode

Write-Host "App.tsx Rewrite Complete!"
