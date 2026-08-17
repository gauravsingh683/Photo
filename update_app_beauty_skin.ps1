$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with Skin Smoothing AR..."

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none', ar: 'none' },
  { name: 'Perfect Skin', css: 'none', ar: 'beauty-skin' },
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
  { name: 'Peachy', css: 'sepia(0.25) hue-rotate(340deg) brightness(1.1) saturate(1.2)', ar: 'none' },
  { name: 'Pearl', css: 'blur(0.2px) brightness(1.2) contrast(0.85) grayscale(0.2)', ar: 'none' },
  { name: 'Sunkissed', css: 'sepia(0.3) brightness(1.05) contrast(0.95) saturate(1.3)', ar: 'none' },
  { name: 'Blush', css: 'saturate(1.2) hue-rotate(340deg) contrast(0.9) brightness(1.05)', ar: 'none' },
  { name: 'Pastel Dream', css: 'brightness(1.1) saturate(0.8) sepia(0.2) hue-rotate(320deg)', ar: 'none' },
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
        const mouthCenter = p(14);
        
        const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // --- TRUE BEAUTY FILTER (SKIN SMOOTHING) ---
        if (selectedFilter.ar === 'beauty-skin') {
           // Face Oval Outline
           const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
           // Left Eye (Reverse)
           const leftEyePts = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246].reverse();
           // Right Eye (Reverse)
           const rightEyePts = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398].reverse();
           // Mouth (Reverse)
           const mouthPts = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191].reverse();
           // Left Eyebrow (Reverse)
           const leftBrow = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107].reverse();
           // Right Eyebrow (Reverse)
           const rightBrow = [276, 283, 282, 295, 285, 300, 293, 334, 296, 336].reverse();

           const drawPath = (indices: number[]) => {
               ctx.moveTo(p(indices[0]).x, p(indices[0]).y);
               for (let i = 1; i < indices.length; i++) {
                   ctx.lineTo(p(indices[i]).x, p(indices[i]).y);
               }
               ctx.closePath();
           };

           ctx.beginPath();
           drawPath(faceOval);
           drawPath(leftEyePts);
           drawPath(rightEyePts);
           drawPath(mouthPts);
           drawPath(leftBrow);
           drawPath(rightBrow);
           
           // Use EvenOdd winding rule so the reverse-drawn eyes/mouth act as holes in the mask!
           ctx.clip("evenodd");

           // Now anything we draw is ONLY applied to the skin (eyes/mouth/eyebrows are perfectly protected!)
           // Apply a smoothing blur and brightness boost
           ctx.filter = 'blur(6px) brightness(1.1) saturate(1.1)';
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           
           // Add a very subtle pink blush to the skin layer
           ctx.fillStyle = 'rgba(255, 180, 180, 0.1)';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           
           // Restore so subsequent frames draw normally
           ctx.restore();
        }

        // --- ELDERLY ---
        else if (selectedFilter.ar === 'older') {
          // Shrink eyes slightly (squint) using magnify logic
          const drawMagnifier = (x: number, y: number, radius: number, scale: number) => {
             ctx.save(); ctx.beginPath(); ctx.arc(x, y, radius * scale, 0, Math.PI * 2); ctx.clip();
             const sx = x - radius; const sy = y - radius; const sw = radius * 2;
             const dw = sw * scale; const dx = x - dw / 2; const dy = y - dw / 2;
             ctx.drawImage(video, sx, sy, sw, sw, dx, dy, dw, dw);
             ctx.restore();
          };
          drawMagnifier(leftEye.x, leftEye.y, eyeDist * 0.6, 0.8);
          drawMagnifier(rightEye.x, rightEye.y, eyeDist * 0.6, 0.8);
          
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
          ctx.translate(centerX, centerY); ctx.rotate(angle);
          const w = eyeDist * 2.8; const h = w * 0.25; const leftX = -w/2; const topY = -h/2;
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
          ctx.fillRect(leftX, topY, w, h * 0.2); ctx.fillRect(-w*0.1, topY, w*0.2, h*0.4);
          ctx.fillRect(leftX + w*0.05, topY + h*0.2, w*0.35, h*0.8); ctx.fillRect(leftX + w*0.1, topY + h*0.2, w*0.25, h);
          ctx.fillRect(leftX + w*0.6, topY + h*0.2, w*0.35, h*0.8); ctx.fillRect(leftX + w*0.65, topY + h*0.2, w*0.25, h);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(leftX + w*0.12, topY + h*0.3, w*0.05, h*0.2); ctx.fillRect(leftX + w*0.67, topY + h*0.3, w*0.05, h*0.2);
        }
        else if (selectedFilter.ar === 'glasses-aviator') {
          ctx.translate(centerX, centerY); ctx.rotate(angle);
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
        else if (selectedFilter.ar === 'glasses-heart') {
          ctx.translate(centerX, centerY); ctx.rotate(angle);
          const drawHeart = (x: number, y: number, width: number, height: number) => {
            ctx.save(); ctx.beginPath(); const topCurveHeight = height * 0.3;
            ctx.moveTo(x, y + topCurveHeight);
            ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
            ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);
            ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);
            ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
            ctx.closePath();
            ctx.fillStyle = 'rgba(236, 72, 153, 0.7)'; ctx.fill();
            ctx.strokeStyle = '#be185d'; ctx.lineWidth = width * 0.08; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - width*0.3, y + height*0.2); ctx.lineTo(x - width*0.1, y + height*0.1);
            ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = width * 0.05; ctx.stroke();
            ctx.restore();
          };
          const heartW = eyeDist * 1.3; const heartH = heartW * 0.9;
          ctx.beginPath(); ctx.moveTo(-eyeDist*0.3, -heartH*0.1); ctx.bezierCurveTo(0, -heartH*0.3, 0, -heartH*0.3, eyeDist*0.3, -heartH*0.1);
          ctx.strokeStyle = '#be185d'; ctx.lineWidth = heartW * 0.08; ctx.stroke();
          drawHeart(-eyeDist*0.5, -heartH*0.4, heartW, heartH); drawHeart(eyeDist*0.5, -heartH*0.4, heartW, heartH);
        }
        else if (selectedFilter.ar === 'dog') {
          ctx.font = `${eyeDist}px serif`; ctx.fillText("🐶", nose.x, nose.y);
          ctx.font = `${eyeDist * 3}px serif`; ctx.translate(forehead.x, forehead.y - (eyeDist * 1.5)); ctx.rotate(angle); ctx.fillText("🐕", 0, 0);
        }
        else if (selectedFilter.ar === 'mask') {
          ctx.translate(centerX, centerY); ctx.rotate(angle); ctx.font = `${eyeDist * 3.5}px serif`; ctx.fillText("🎭", 0, 0);
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
                             {f.ar === 'beauty-skin' && "✨"}
                             {f.ar === 'older' && "👴"}
                             {f.ar === 'glasses-8bit' && "🕶️"}
                             {f.ar === 'glasses-aviator' && "😎"}
                             {f.ar === 'glasses-heart' && "😍"}
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
