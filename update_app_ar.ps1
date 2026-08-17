$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with MediaPipe AR..."

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none', ar: 'none' },
  { name: 'Soft Beauty', css: 'blur(0.5px) brightness(1.1) contrast(0.95) saturate(1.1)', ar: 'none' },
  { name: 'Thug Life', css: 'contrast(1.1)', ar: 'sunglasses' },
  { name: 'Heart Eyes', css: 'saturate(1.2)', ar: 'hearts' },
  { name: 'Puppy', css: 'brightness(1.05)', ar: 'dog' },
  { name: 'Masquerade', css: 'contrast(1.2)', ar: 'mask' },
  { name: 'Paris', css: 'brightness(1.15) contrast(0.95) saturate(0.85) sepia(0.1)', ar: 'none' },
  { name: 'Peachy', css: 'sepia(0.25) hue-rotate(340deg) brightness(1.1) saturate(1.2)', ar: 'none' }
];

const THUMBNAIL_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(3);
  
  // MediaPipe state
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [arOverlaySrc, setArOverlaySrc] = useState<string | null>(null);

  const selectedFilter = FILTERS[selectedFilterIndex];

  // Initialize MediaPipe
  useEffect(() => {
    const initAR = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1
      });
      faceLandmarkerRef.current = faceLandmarker;
    };
    initAR();
  }, []);

  // AR Loop
  const renderLoop = useCallback(() => {
    if (!faceLandmarkerRef.current || !webcamRef.current?.video || !canvasRef.current) {
      requestRef.current = requestAnimationFrame(renderLoop);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.readyState >= 2 && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const startTimeMs = performance.now();
      const results = faceLandmarkerRef.current.detectForVideo(video, startTimeMs);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        
        // Map landmarks to canvas pixels
        const p = (index: number) => ({
           x: landmarks[index].x * canvas.width,
           y: landmarks[index].y * canvas.height
        });

        const leftEye = p(159);
        const rightEye = p(386);
        const nose = p(1);
        const forehead = p(10);
        
        const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (selectedFilter.ar === 'sunglasses') {
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          ctx.font = `${eyeDist * 3}px serif`;
          ctx.fillText("🕶️", 0, 0);
        }
        else if (selectedFilter.ar === 'hearts') {
          ctx.font = `${eyeDist * 1.5}px serif`;
          ctx.translate(leftEye.x, leftEye.y);
          ctx.rotate(angle);
          ctx.fillText("😍", 0, 0);
          ctx.resetTransform();
          ctx.translate(rightEye.x, rightEye.y);
          ctx.rotate(angle);
          ctx.fillText("😍", 0, 0);
        }
        else if (selectedFilter.ar === 'dog') {
          // Nose
          ctx.font = `${eyeDist}px serif`;
          ctx.fillText("🐶", nose.x, nose.y);
          // Ears (Forehead)
          ctx.font = `${eyeDist * 3}px serif`;
          ctx.translate(forehead.x, forehead.y - (eyeDist * 1.5));
          ctx.rotate(angle);
          ctx.fillText("🐕", 0, 0);
        }
        else if (selectedFilter.ar === 'mask') {
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          ctx.font = `${eyeDist * 3.5}px serif`;
          ctx.fillText("🎭", 0, 0);
        }
        
        ctx.restore();
      }
    }
    
    requestRef.current = requestAnimationFrame(renderLoop);
  }, [selectedFilter]);

  useEffect(() => {
    if (appState === 'FILTER_SELECT' || appState === 'COUNTDOWN') {
      requestRef.current = requestAnimationFrame(renderLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [appState, renderLoop]);

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
    
    // Save AR overlay state
    if (canvasRef.current) {
       setArOverlaySrc(canvasRef.current.toDataURL('image/png'));
    }
    setAppState('FINAL');
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
    setAppState('COUNTDOWN');
  };

  const resetSession = () => {
    setImageSrc(null);
    setArOverlaySrc(null);
    setSelectedFilterIndex(0);
    setAppState('WELCOME');
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {appState === 'WELCOME' && (
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <h1 style={{ fontSize: '5rem', fontWeight: 'bold', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '20px' }}>
            InstaAR
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '40px' }}>Live Facial Recognition & Augmented Reality.</p>
          <button onClick={() => setAppState('FILTER_SELECT')} style={{ padding: '20px 60px', fontSize: '1.5rem', borderRadius: '50px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Open Camera
          </button>
        </div>
      )}

      {(appState === 'FILTER_SELECT' || appState === 'COUNTDOWN') && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
            <Webcam 
              audio={false} 
              ref={webcamRef} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode: "user" }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} 
            />
            
            {/* Transparent AR Canvas */}
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
            />
            
            {appState === 'COUNTDOWN' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10 }}>
                <span style={{ fontSize: '15rem', fontWeight: 'bold', color: 'white' }}>{countdown}</span>
              </div>
            )}
          </div>

          {appState === 'FILTER_SELECT' && (
            <div style={{ position: 'absolute', bottom: '0', width: '100%', height: '250px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 20%, transparent)', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}>
              
              <div style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', transition: 'all 0.3s' }}>
                 <h2 style={{ color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.5)', margin: 0 }}>
                   {selectedFilter.name} {selectedFilter.ar !== 'none' ? '✨ AR' : ''}
                 </h2>
              </div>

              <div style={{ position: 'absolute', bottom: '110px', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ position: 'relative', width: '100px', height: '80px', pointerEvents: 'auto' }}>
                  {FILTERS.map((f, index) => {
                    const diff = index - selectedFilterIndex;
                    const absoluteDiff = Math.abs(diff);
                    
                    const translateX = diff * 75;
                    const translateY = Math.pow(absoluteDiff, 1.8) * 4;
                    const scale = absoluteDiff === 0 ? 1 : Math.max(0.5, 1 - (absoluteDiff * 0.15));
                    const opacity = Math.max(0, 1 - (absoluteDiff * 0.2));
                    const isCenter = absoluteDiff === 0;

                    if (opacity <= 0) return null;

                    return (
                      <div 
                        key={f.name} 
                        onClick={() => setSelectedFilterIndex(index)} 
                        style={{ 
                          position: 'absolute', top: 0, left: '50%',
                          transform: `translate(calc(-50% + ${translateX}px), ${translateY}px) scale(${scale})`,
                          opacity: opacity, zIndex: isCenter ? 10 : 5 - absoluteDiff,
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <div style={{ 
                          width: '70px', height: '70px', borderRadius: '50%', 
                          background: isCenter ? (f.ar !== 'none' ? 'linear-gradient(45deg, #10b981, #3b82f6)' : 'linear-gradient(45deg, #f09433, #bc1888)') : 'rgba(255,255,255,0.8)',
                          padding: isCenter ? '4px' : '2px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                             {f.ar === 'sunglasses' && "🕶️"}
                             {f.ar === 'hearts' && "😍"}
                             {f.ar === 'dog' && "🐶"}
                             {f.ar === 'mask' && "🎭"}
                             {f.ar === 'none' && <img src={THUMBNAIL_URL} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: f.css }} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                 <button onClick={startCountdown} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', border: '5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'white' }}></div>
                 </button>
              </div>

            </div>
          )}
        </div>
      )}

      {appState === 'FINAL' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s' }}>
          
          <div style={{ position: 'relative', height: '80vh', maxWidth: '100%', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <img src={imageSrc as string} alt="Final Background" style={{ height: '100%', objectFit: 'contain', filter: selectedFilter.css }} />
            {arOverlaySrc && (
               <img src={arOverlaySrc} alt="AR Overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
             <button onClick={resetSession} style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Try Another AR Filter
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

Write-Host "App.tsx AR Rewrite Complete!"
