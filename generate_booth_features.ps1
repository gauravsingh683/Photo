$ErrorActionPreference = "Continue"

Write-Host "Installing qrcode.react..."
cd c:\Photo\booth-app
npm install qrcode.react

$boothAppTsxCode = @"
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, RefreshCcw, Check, Printer, Share2, Home, Mail, MessageCircle, Smartphone } from 'lucide-react';

type BoothState = 'WELCOME' | 'LANGUAGE' | 'THEME' | 'CAMERA' | 'COUNTDOWN' | 'PREVIEW' | 'PROCESSING' | 'FINAL';

const AI_THEMES = [
  { id: 'anime', name: 'Anime Style', color: '#ff4b4b' },
  { id: 'pixar', name: 'Pixar 3D', color: '#10b981' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: '#7000FF' },
  { id: 'royal', name: 'Royal King/Queen', color: '#fbbf24' },
  { id: 'superhero', name: 'Superhero', color: '#ef4444' },
  { id: 'vintage', name: 'Vintage 90s', color: '#a8a29e' },
];

function App() {
  const [appState, setAppState] = useState<BoothState>('WELCOME');
  const [language, setLanguage] = useState('EN');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);

  // Handle Countdown
  useEffect(() => {
    let timer: number;
    if (appState === 'COUNTDOWN' && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (appState === 'COUNTDOWN' && countdown === 0) {
      capture();
    }
    return () => clearTimeout(timer);
  }, [appState, countdown]);

  // Handle Fake Processing
  useEffect(() => {
    if (appState === 'PROCESSING') {
      const timer = setTimeout(() => {
        setAppState('FINAL');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImageSrc(imageSrc || null);
    setAppState('PREVIEW');
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
    setAppState('COUNTDOWN');
  };

  const resetSession = () => {
    setImageSrc(null);
    setSelectedTheme('');
    setShowQR(false);
    setShowEmail(false);
    setAppState('WELCOME');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#09090b', color: '#fff', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. WELCOME SCREEN */}
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 1s' }}>
          <h1 style={{ fontSize: '6rem', marginBottom: '10px', background: 'linear-gradient(45deg, #FF007A, #7000FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>
            AI Photo Booth Pro
          </h1>
          <p style={{ fontSize: '2rem', marginBottom: '60px', color: '#a1a1aa' }}>Touch to create magic.</p>
          <button 
            onClick={() => setAppState('LANGUAGE')}
            style={{ padding: '30px 80px', fontSize: '3rem', borderRadius: '60px', border: 'none', backgroundColor: '#FF007A', color: 'white', cursor: 'pointer', boxShadow: '0 0 40px rgba(255, 0, 122, 0.4)', fontWeight: 'bold' }}>
            Start Session
          </button>
        </div>
      )}

      {/* 2. LANGUAGE SELECTION */}
      {appState === 'LANGUAGE' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '40px' }}>Choose Language</h2>
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
            {['English', 'Spanish', 'French', 'German'].map(lang => (
              <button 
                key={lang}
                onClick={() => setAppState('THEME')}
                style={{ padding: '30px 50px', fontSize: '2rem', borderRadius: '20px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer' }}>
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. THEME SELECTION */}
      {appState === 'THEME' && (
        <div style={{ textAlign: 'center', width: '80%' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '40px' }}>Choose AI Theme</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
            {AI_THEMES.map(theme => (
              <button 
                key={theme.id}
                onClick={() => { setSelectedTheme(theme.name); setAppState('CAMERA'); }}
                style={{ padding: '40px 20px', fontSize: '2rem', borderRadius: '20px', backgroundColor: '#18181b', border: \`4px solid \${theme.color}\`, color: 'white', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.2s' }}>
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4 & 5. CAMERA & COUNTDOWN */}
      {(appState === 'CAMERA' || appState === 'COUNTDOWN') && (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {appState === 'CAMERA' && (
            <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}>
               <button 
                onClick={startCountdown}
                style={{ padding: '30px 80px', fontSize: '3rem', borderRadius: '60px', border: 'none', backgroundColor: '#7000FF', color: 'white', cursor: 'pointer', boxShadow: '0 0 40px rgba(112, 0, 255, 0.6)', fontWeight: 'bold' }}>
                Capture
              </button>
            </div>
          )}
          {appState === 'COUNTDOWN' && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20rem', fontWeight: 'bold', textShadow: '0 0 50px rgba(0,0,0,1)' }}>
              {countdown > 0 ? countdown : ''}
            </div>
          )}
        </div>
      )}

      {/* 6. PREVIEW */}
      {appState === 'PREVIEW' && imageSrc && (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Captured" />
          <div style={{ position: 'absolute', bottom: '10%', width: '100%', display: 'flex', justifyContent: 'center', gap: '40px' }}>
             <button 
              onClick={() => setAppState('CAMERA')}
              style={{ padding: '25px 50px', fontSize: '2rem', borderRadius: '50px', border: 'none', backgroundColor: '#27272a', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <RefreshCcw size={30}/> Retake
            </button>
            <button 
              onClick={() => setAppState('PROCESSING')}
              style={{ padding: '25px 50px', fontSize: '2rem', borderRadius: '50px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)' }}>
              <Check size={30}/> Generate {selectedTheme}
            </button>
          </div>
        </div>
      )}

      {/* 7. PROCESSING */}
      {appState === 'PROCESSING' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '150px', height: '150px', border: '15px solid #27272a', borderTopColor: '#7000FF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 50px' }} />
          <h2 style={{ fontSize: '4rem', fontWeight: 'bold' }}>Applying {selectedTheme}...</h2>
          <p style={{ fontSize: '2rem', color: '#a1a1aa', marginTop: '20px' }}>Removing background and enhancing quality via Enterprise AI</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      {/* 8. FINAL & SHARING */}
      {appState === 'FINAL' && imageSrc && (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '40px', fontWeight: 'bold', background: 'linear-gradient(45deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your {selectedTheme} Photo!
          </h2>
          
          <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
            {/* Before / After Simulation */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '300px', height: '400px', backgroundColor: '#27272a', borderRadius: '20px', overflow: 'hidden', border: '2px solid #52525b', position: 'relative' }}>
                    <div style={{position:'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '10px'}}>Original</div>
                    <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} alt="Original" />
                </div>
                <div style={{ width: '300px', height: '400px', backgroundColor: '#27272a', borderRadius: '20px', overflow: 'hidden', border: '4px solid #7000FF', boxShadow: '0 0 40px rgba(112, 0, 255, 0.4)', position: 'relative' }}>
                     <div style={{position:'absolute', top: 10, left: 10, background: '#7000FF', padding: '5px 10px', borderRadius: '10px'}}>{selectedTheme}</div>
                    <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="AI Enhanced" />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <button style={{ padding: '25px 40px', fontSize: '1.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '350px' }}>
                <Printer size={35}/> Print 4x6 Template
              </button>
              <button 
                onClick={() => { setShowQR(true); setShowEmail(false); }}
                style={{ padding: '25px 40px', fontSize: '1.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '350px' }}>
                <Smartphone size={35}/> Download via QR
              </button>
              <button 
                onClick={() => { setShowEmail(true); setShowQR(false); }}
                style={{ padding: '25px 40px', fontSize: '1.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#eab308', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '350px' }}>
                <Mail size={35}/> Email / SMS
              </button>
              <button 
                onClick={resetSession}
                style={{ padding: '25px 40px', fontSize: '1.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', width: '350px', marginTop: '20px' }}>
                <Home size={35}/> Finish Session
              </button>
            </div>
          </div>

          {/* QR Overlay */}
          {showQR && (
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '40px', borderRadius: '20px', color: 'black', textAlign: 'center', boxShadow: '0 0 100px rgba(0,0,0,0.8)'}}>
                  <h3 style={{fontSize: '2rem', marginBottom: '20px'}}>Scan to Download</h3>
                  <QRCodeSVG value="https://aiphotobooth.com/gallery/12345" size={256} />
                  <button onClick={() => setShowQR(false)} style={{marginTop: '30px', padding: '15px 30px', fontSize: '1.2rem', background: '#e4e4e7', border: 'none', borderRadius: '10px', cursor: 'pointer'}}>Close</button>
              </div>
          )}

           {/* Email Overlay */}
           {showEmail && (
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#18181b', padding: '40px', borderRadius: '20px', color: 'white', textAlign: 'center', boxShadow: '0 0 100px rgba(0,0,0,0.8)', border: '2px solid #3f3f46'}}>
                  <h3 style={{fontSize: '2rem', marginBottom: '20px'}}>Enter Email Address</h3>
                  <input type="email" placeholder="guest@example.com" style={{padding: '20px', fontSize: '1.5rem', width: '100%', marginBottom: '20px', borderRadius: '10px', border: 'none'}} />
                  <button onClick={() => setShowEmail(false)} style={{padding: '20px 40px', fontSize: '1.5rem', background: '#FF007A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', width: '100%'}}>Send Photos</button>
                  <button onClick={() => setShowEmail(false)} style={{marginTop: '20px', padding: '15px 30px', fontSize: '1.2rem', background: 'transparent', color: '#a1a1aa', border: 'none', cursor: 'pointer'}}>Cancel</button>
              </div>
          )}
        </div>
      )}

    </div>
  );
}

export default App;
"@
Set-Content -Path "c:\Photo\booth-app\src\App.tsx" -Value $boothAppTsxCode
