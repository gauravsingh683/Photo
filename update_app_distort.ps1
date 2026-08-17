$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with WebGL-style Magnification Filters..."

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none', ar: 'none' },
  { name: 'Frog Face', css: 'none', ar: 'bulge-eyes' },
  { name: 'Chubby', css: 'none', ar: 'bulge-cheeks' },
  { name: 'Elderly', css: 'grayscale(0.6) contrast(1.2) sepia(0.2)', ar: 'older' },
  { name: 'Soft Beauty', css: 'blur(0.5px) brightness(1.1) contrast(0.95) saturate(1.1)', ar: 'none' },
  { name: '8-Bit Specs', css: 'contrast(1.1)', ar: 'glasses-8bit' },
  { name: 'Aviators', css: 'contrast(1.05)', ar: 'glasses-aviator' },
  { name: 'Love Specs', css: 'saturate(1.1)', ar: 'glasses-heart' },
  { name: 'Puppy', css: 'brightness(1.05)', ar: 'dog' },
  { name: 'Masquerade', css: 'contrast(1.2)', ar: 'mask' },
  { name: 'Face Glow', css: 'brightness(1.15) contrast(0.9) saturate(1.2) drop-shadow(0 0 10px rgba(255,192,203,0.4))', ar: 'none' },
  { name: 'Fairy Glow', css: 'brightness(1.1) contrast(0.9) saturate(1.2) drop-shadow(0 0 10px rgba(255,192,203,0.3))', ar: 'none' },
  { name: 'Rosy Pink', css: 'sepia(0.15) hue-rotate(330deg) brightness(1.1) contrast(0.95) saturate(1.2)', ar: 'none' },
  { name: 'Paris', css: 'brightness(1.15) contrast(0.95) saturate(0.85) sepia(0.1)', ar: 'none' },
  { name: 'Sunkissed', css: 'sepia(0.3) brightness(1.05) contrast(0.95) saturate(1.3)', ar: 'none' }
];

const THUMBNAIL_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(3);
  
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>();
  
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [arOverlaySrc, setArOverlaySrc] = useState<string | null>(null);

  const selectedFilter = FILTERS[selectedFilterIndex];

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
        
        const p = (index: number) => ({
           x: landmarks[index].x * canvas.width,
           y: landmarks[index].y * canvas.height
        });

        const leftEye = p(159);
        const rightEye = p(386);
        const nose = p(1);
        const forehead = p(10);
        const leftCheek = p(116);
        const rightCheek = p(345);
        const chin = p(152);
        const mouthCenter = p(14);
        
        const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // --- DISTORTION MAGNIFYING GLASS FILTERS ---
        
        const drawMagnifier = (x: number, y: number, radius: number, scale: number) => {
           // Helper to draw a magnified circular clipping region of the video
           ctx.save();
           ctx.beginPath();
           ctx.arc(x, y, radius * scale, 0, Math.PI * 2);
           ctx.clip();
           
           const sourceX = x - radius;
           const sourceY = y - radius;
           const sourceW = radius * 2;
           const sourceH = radius * 2;
           
           const destW = sourceW * scale;
           const destH = sourceH * scale;
           const destX = x - destW / 2;
           const destY = y - destH / 2;
           
           ctx.drawImage(video, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
           
           // Soft feather inner shadow to hide the sharp edge
           const grad = ctx.createRadialGradient(x, y, radius*scale*0.8, x, y, radius*scale);
           grad.addColorStop(0, 'rgba(0,0,0,0)');
           grad.addColorStop(1, 'rgba(0,0,0,0.3)');
           ctx.fillStyle = grad;
           ctx.fillRect(destX, destY, destW, destH);
           
           ctx.restore();
        };

        if (selectedFilter.ar === 'bulge-eyes') {
          // Frog Eyes (Huge magnification around eyes)
          drawMagnifier(leftEye.x, leftEye.y, eyeDist * 0.7, 1.8);
          drawMagnifier(rightEye.x, rightEye.y, eyeDist * 0.7, 1.8);
        }
        else if (selectedFilter.ar === 'bulge-cheeks') {
          // Fat Cheeks (Magnify cheeks)
          drawMagnifier(leftCheek.x, leftCheek.y + eyeDist*0.3, eyeDist * 0.8, 1.6);
          drawMagnifier(rightCheek.x, rightCheek.y + eyeDist*0.3, eyeDist * 0.8, 1.6);
          drawMagnifier(chin.x, chin.y, eyeDist * 0.6, 1.4); // double chin
        }
        else if (selectedFilter.ar === 'older') {
          // Old Filter
          // 1. Shrink eyes slightly (squint)
          drawMagnifier(leftEye.x, leftEye.y, eyeDist * 0.6, 0.8);
          drawMagnifier(rightEye.x, rightEye.y, eyeDist * 0.6, 0.8);
          
          // 2. Draw grey mustache/beard procedurally
          ctx.translate(mouthCenter.x, mouthCenter.y);
          ctx.rotate(angle);
          
          ctx.fillStyle = 'rgba(200, 200, 200, 0.85)';
          
          // Mustache
          ctx.beginPath();
          ctx.moveTo(-eyeDist*0.6, -eyeDist*0.1);
          ctx.quadraticCurveTo(0, -eyeDist*0.4, eyeDist*0.6, -eyeDist*0.1);
          ctx.quadraticCurveTo(0, eyeDist*0.2, -eyeDist*0.6, -eyeDist*0.1);
          ctx.fill();

          // Eyebrows
          ctx.resetTransform();
          ctx.translate(leftEye.x, leftEye.y - eyeDist*0.5);
          ctx.rotate(angle);
          ctx.fillRect(-eyeDist*0.4, 0, eyeDist*0.8, eyeDist*0.15);
          
          ctx.resetTransform();
          ctx.translate(rightEye.x, rightEye.y - eyeDist*0.5);
          ctx.rotate(angle);
          ctx.fillRect(-eyeDist*0.4, 0, eyeDist*0.8, eyeDist*0.15);
        }

        // --- GLASSES AR FILTERS ---
        else if (selectedFilter.ar === 'glasses-8bit') {
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          const w = eyeDist * 2.8; const h = w * 0.25; const leftX = -w/2; const topY = -h/2;
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillRect(leftX, topY, w, h * 0.2); ctx.fillRect(-w*0.1, topY, w*0.2, h*0.4);
          ctx.fillRect(leftX + w*0.05, topY + h*0.2, w*0.35, h*0.8); ctx.fillRect(leftX + w*0.1, topY + h*0.2, w*0.25, h);
          ctx.fillRect(leftX + w*0.6, topY + h*0.2, w*0.35, h*0.8); ctx.fillRect(leftX + w*0.65, topY + h*0.2, w*0.25, h);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(leftX + w*0.12, topY + h*0.3, w*0.05, h*0.2); ctx.fillRect(leftX + w*0.67, topY + h*0.3, w*0.05, h*0.2);
        }
        else if (selectedFilter.ar === 'glasses-aviator') {
          ctx.translate(centerX, centerY);
          ctx.rotate(angle);
          const w = eyeDist * 2.5; const h = w * 0.45; const lensW = w * 0.45;
          ctx.strokeStyle = '#d4d4d8'; ctx.lineWidth = w * 0.02;
          const grad = ctx.createLinearGradient(0, -h/2, 0, h/2);
          grad.addColorStop(0, 'rgba(20, 20, 20, 0.95)'); grad.addColorStop(1, 'rgba(60, 60, 80, 0.7)');
          ctx.fillStyle = grad;
          const drawTeardrop = (xOffset: number) => {
            ctx.beginPath(); ctx.moveTo(xOffset, -h/2 + h*0.2);
            ctx.bezierCurveTo(xOffset + lensW*0.6, -h/2, xOffset + lensW, -h/2 + h*0.1, xOffset + lensW, 0);
            ctx.bezierCurveTo(xOffset + lensW, h/2, xOffset + lensW*0.5, h/2, xOffset + lensW*0.2, h/2);
            ctx.bezierCurveTo(xOffset, h/2, xOffset - lensW*0.1, h/2 - h*0.3, xOffset, -h/2 + h*0.2);
            ctx.fill(); ctx.stroke();
          };
          drawTeardrop(-w/2);
          ctx.save(); ctx.translate(w/2, 0); ctx.scale(-1, 1); drawTeardrop(0); ctx.restore();
          ctx.beginPath(); ctx.moveTo(-w*0.15, -h/2 + h*0.2); ctx.bezierCurveTo(-w*0.05, -h/2, w*0.05, -h/2, w*0.15, -h/2 + h*0.2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-w*0.2, -h/2 + h*0.05); ctx.lineTo(w*0.2, -h/2 + h*0.05); ctx.stroke();
        }
        else if (selectedFilter.ar === 'dog') {
          ctx.font = `${eyeDist}px serif`;
          ctx.fillText("🐶", nose.x, nose.y);
          ctx.font = `${eyeDist * 3}px serif`;
          ctx.translate(forehead.x, forehead.y - (eyeDist * 1.5));
          ctx.rotate(angle);
          ctx.fillText("🐕", 0, 0);
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
          <p style={{ fontSize: '1.2rem', color: '#a1a1aa', marginBottom: '40px' }}>Distortion Engine Online.</p>
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
                             {f.ar === 'bulge-eyes' && "🐸"}
                             {f.ar === 'bulge-cheeks' && "🐹"}
                             {f.ar === 'older' && "👴"}
                             {f.ar === 'glasses-8bit' && "🕶️"}
                             {f.ar === 'glasses-aviator' && "😎"}
                             {f.ar === 'dog' && "🐶"}
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
