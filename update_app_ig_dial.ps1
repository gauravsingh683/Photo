$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with Curved Filter Dial..."

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none' },
  { name: 'Soft Beauty', css: 'blur(0.5px) brightness(1.1) contrast(0.95) saturate(1.1)' },
  { name: 'Rosy Pink', css: 'sepia(0.15) hue-rotate(330deg) brightness(1.1) contrast(0.95) saturate(1.2)' },
  { name: 'Paris', css: 'brightness(1.15) contrast(0.95) saturate(0.85) sepia(0.1)' },
  { name: 'Peachy', css: 'sepia(0.25) hue-rotate(340deg) brightness(1.1) saturate(1.2)' },
  { name: 'Fairy Glow', css: 'brightness(1.1) contrast(0.9) saturate(1.2) drop-shadow(0 0 10px rgba(255,192,203,0.3))' },
  { name: 'Pastel Dream', css: 'brightness(1.1) saturate(0.8) sepia(0.2) hue-rotate(320deg)' },
  { name: 'Sunkissed', css: 'sepia(0.3) brightness(1.05) contrast(0.95) saturate(1.3)' },
  { name: 'Blush', css: 'saturate(1.2) hue-rotate(340deg) contrast(0.9) brightness(1.05)' },
  { name: 'Pearl', css: 'blur(0.2px) brightness(1.2) contrast(0.85) grayscale(0.2)' },
  { name: 'Vintage Warm', css: 'sepia(0.4) contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Airy', css: 'brightness(1.1) contrast(0.85) saturate(0.9)' },
  { name: 'Golden Hour', css: 'sepia(0.3) saturate(1.4) brightness(1.05) contrast(1.05) hue-rotate(-10deg)' },
  { name: 'Gingham', css: 'brightness(1.05) hue-rotate(-10deg) contrast(0.9)' },
  { name: 'Clarendon', css: 'contrast(1.1) saturate(1.2)' },
  { name: 'Lark', css: 'contrast(0.9) saturate(1.1) brightness(1.1)' }
];

const THUMBNAIL_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const selectedFilter = FILTERS[selectedFilterIndex];

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
    setSelectedFilterIndex(0);
    setAppState('WELCOME');
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* WELCOME SCREEN */}
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 style={{ fontSize: '5rem', fontWeight: 'bold', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
            InstaBeauty
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '40px' }}>Scrollable Curved Filter Dial!</p>
          <button onClick={() => setAppState('FILTER_SELECT')} style={{ padding: '20px 60px', fontSize: '1.5rem', borderRadius: '50px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Open Camera
          </button>
        </div>
      )}

      {/* FILTER SELECT & LIVE PREVIEW */}
      {(appState === 'FILTER_SELECT' || appState === 'COUNTDOWN') && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Live Webcam Background */}
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            <Webcam 
              audio={false} 
              ref={webcamRef} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode: "user" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css, transition: 'filter 0.3s ease' }} 
            />
            
            {/* Countdown Overlay */}
            {appState === 'COUNTDOWN' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
                <span style={{ fontSize: '15rem', fontWeight: 'bold', color: 'white' }}>{countdown}</span>
              </div>
            )}
          </div>

          {/* Bottom UI - Curved Dial */}
          {appState === 'FILTER_SELECT' && (
            <div style={{ position: 'absolute', bottom: '0', width: '100%', height: '250px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 20%, transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
              
              {/* Filter Name Text Above Dial */}
              <div style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', transition: 'all 0.3s' }}>
                 <h2 style={{ color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.5)', margin: 0 }}>
                   {selectedFilter.name}
                 </h2>
              </div>

              {/* Curved Dial Container */}
              <div style={{ position: 'absolute', bottom: '110px', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ position: 'relative', width: '100px', height: '80px', pointerEvents: 'auto' }}>
                  {FILTERS.map((f, index) => {
                    const diff = index - selectedFilterIndex;
                    const absoluteDiff = Math.abs(diff);
                    
                    // Math for the Curve
                    const translateX = diff * 75; // Horizontal spread
                    const translateY = Math.pow(absoluteDiff, 1.8) * 4; // Curved drop (parabola)
                    const scale = absoluteDiff === 0 ? 1 : Math.max(0.5, 1 - (absoluteDiff * 0.15));
                    const opacity = Math.max(0, 1 - (absoluteDiff * 0.2));
                    const isCenter = absoluteDiff === 0;

                    if (opacity <= 0) return null; // Don't render if too far

                    return (
                      <div 
                        key={f.name} 
                        onClick={() => setSelectedFilterIndex(index)} 
                        style={{ 
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          transform: `translate(calc(-50% + ${translateX}px), ${translateY}px) scale(${scale})`,
                          opacity: opacity,
                          zIndex: isCenter ? 10 : 5 - absoluteDiff,
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Circular Thumbnail Wrapper */}
                        <div style={{ 
                          width: '70px', 
                          height: '70px', 
                          borderRadius: '50%', 
                          background: isCenter ? 'linear-gradient(45deg, #f09433, #bc1888)' : 'rgba(255,255,255,0.8)',
                          padding: isCenter ? '4px' : '2px',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'black' }}>
                             {/* The actual image with the CSS filter applied */}
                             <img src={THUMBNAIL_URL} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: f.css }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Huge Capture Button */}
              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                 <button onClick={startCountdown} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                 </button>
              </div>

            </div>
          )}
        </div>
      )}

      {/* FINAL SCREEN */}
      {appState === 'FINAL' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s' }}>
          
          <div style={{ position: 'relative', height: '80vh', maxWidth: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <img src={imageSrc as string} alt="Final" style={{ height: '100%', objectFit: 'contain', filter: selectedFilter.css }} />
            
            <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ec4899', border: '2px solid white', overflow: 'hidden' }}>
                   <img src={THUMBNAIL_URL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               </div>
               <span style={{ fontWeight: 'bold', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>Your Story</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
             <button style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', background: 'linear-gradient(45deg, #f09433, #bc1888)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Share to Story 🚀
             </button>
             <button onClick={resetSession} style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Discard
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
