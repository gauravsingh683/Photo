$ErrorActionPreference = "Continue"

$appTsxCode = @'
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'PREVIEW' | 'FRAME_SELECT' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none', ar: 'none' },
  { name: 'Perfect Skin', css: 'none', ar: 'beauty-skin' },
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

const FRAMES = [
  { id: 'none', name: 'No Frame' },
  { id: 'insta', name: 'Insta Post' },
  { id: 'social', name: 'Social Viral' },
  { id: 'magazine', name: 'VOGUE Cover' }
];

const THUMBNAIL_URL = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('WELCOME');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [selectedFrameId, setSelectedFrameId] = useState('none');
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
        
        const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
        const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (selectedFilter.ar === 'beauty-skin') {
           const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
           const leftEyePts = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246].reverse();
           const rightEyePts = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398].reverse();
           const mouthPts = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191].reverse();
           const leftBrow = [46, 53, 52, 65, 55, 70, 63, 105, 66, 107].reverse();
           const rightBrow = [276, 283, 282, 295, 285, 300, 293, 334, 296, 336].reverse();

           const drawPath = (indices: number[]) => {
               ctx.moveTo(p(indices[0]).x, p(indices[0]).y);
               for (let i = 1; i < indices.length; i++) {
                   ctx.lineTo(p(indices[i]).x, p(indices[i]).y);
               }
               ctx.closePath();
           };

           ctx.beginPath(); drawPath(faceOval); drawPath(leftEyePts); drawPath(rightEyePts); drawPath(mouthPts); drawPath(leftBrow); drawPath(rightBrow);
           ctx.clip("evenodd");

           ctx.globalAlpha = 0.4;
           ctx.filter = 'blur(8px) brightness(1.1) saturate(1.2)';
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           
           ctx.globalAlpha = 1.0;
           ctx.fillStyle = 'rgba(255, 180, 180, 0.05)';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
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
    setAppState('PREVIEW');
  }, [webcamRef]);

  const startCountdown = () => {
    setCountdown(3);
    setAppState('COUNTDOWN');
  };

  const resetSession = () => {
    setImageSrc(null);
    setArOverlaySrc(null);
    setSelectedFrameId('none');
    setAppState('FILTER_SELECT'); // Jump straight back to filter select, skip welcome
  };

  const approvePhoto = () => {
    setAppState('FRAME_SELECT');
  };

  const finishSession = () => {
    setAppState('FINAL');
  };

  // Graphic Frame Components
  const FrameInsta = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 5, padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', padding: '12px 15px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', padding: '2px', marginRight: '10px' }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: 'white', borderRadius: '50%' }}></div>
        </div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ color: '#000', fontWeight: 'bold', fontSize: '14px', lineHeight: '1.2' }}>instabooth_user</div>
          <div style={{ color: '#8e8e8e', fontSize: '12px' }}>Photo Booth • Just now</div>
        </div>
        <div style={{ fontWeight: 'bold', color: '#000', fontSize: '20px', letterSpacing: '2px' }}>...</div>
      </div>
      <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '15px', boxShadow: '0 -4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
          <span style={{ fontSize: '24px' }}>❤️</span>
          <span style={{ fontSize: '24px' }}>💬</span>
          <span style={{ fontSize: '24px' }}>✈️</span>
        </div>
        <div style={{ color: '#000', fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>1,429 likes</div>
        <div style={{ color: '#000', fontSize: '14px' }}><span style={{ fontWeight: 'bold' }}>instabooth_user</span> Having an amazing time at the event! ✨📸</div>
      </div>
    </div>
  );

  const FrameSocial = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 5, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
           <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginRight: '10px' }}>P</div>
           <div>
             <div style={{ color: '#050505', fontWeight: '600', fontSize: '15px' }}>Photo Booth User</div>
             <div style={{ color: '#65676B', fontSize: '13px' }}>Just now • 🌎</div>
           </div>
        </div>
        <div style={{ color: '#050505', fontSize: '15px', marginBottom: '15px' }}>Checking out this awesome new AR filter! 🚀</div>
        <div style={{ borderTop: '1px solid #CED0D4', paddingTop: '10px', display: 'flex', justifyContent: 'space-around', color: '#65676B', fontWeight: '600', fontSize: '14px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>👍 Like</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>💬 Comment</div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>↪️ Share</div>
        </div>
      </div>
    </div>
  );

  const FrameMagazine = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '15px solid white', boxSizing: 'border-box', zIndex: 5, display: 'flex', flexDirection: 'column' }}>
       <div style={{ width: '100%', textAlign: 'center', paddingTop: '20px' }}>
         <h1 style={{ fontFamily: 'Times New Roman, serif', fontSize: '100px', margin: 0, color: 'rgba(255,255,255,0.9)', textShadow: '0 5px 15px rgba(0,0,0,0.8)', letterSpacing: '8px', fontWeight: 'normal' }}>VOGUE</h1>
       </div>
       <div style={{ flexGrow: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20px', bottom: '40px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)', maxWidth: '200px' }}>
             <h3 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>SUMMER CHIC</h3>
             <p style={{ fontSize: '14px', margin: 0 }}>The ultimate guide to looking flawless this season.</p>
          </div>
          <div style={{ position: 'absolute', right: '20px', top: '40px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.8)', maxWidth: '180px', textAlign: 'right' }}>
             <h3 style={{ fontSize: '20px', margin: '0 0 5px 0' }}>EXCLUSIVE</h3>
             <p style={{ fontSize: '14px', margin: 0 }}>Behind the scenes with the star of the year.</p>
          </div>
          <div style={{ position: 'absolute', right: '20px', bottom: '40px', color: '#ffcc00', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
             <div style={{ fontSize: '40px', fontWeight: 'bold' }}>2026</div>
             <div style={{ fontSize: '20px', letterSpacing: '4px', textAlign: 'right' }}>ISSUE</div>
          </div>
       </div>
    </div>
  );

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
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            
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
                    const absDiff = Math.abs(diff);
                    if (absDiff > 4) return null;
                    return (
                      <div 
                        key={f.name} onClick={() => setSelectedFilterIndex(index)} 
                        style={{ 
                          position: 'absolute', top: 0, left: '50%',
                          transform: `translate(calc(-50% + ${diff * 75}px), ${Math.pow(absDiff, 1.8) * 4}px) scale(${absDiff === 0 ? 1 : Math.max(0.5, 1 - (absDiff * 0.15))})`,
                          opacity: Math.max(0, 1 - (absDiff * 0.2)), zIndex: absDiff === 0 ? 10 : 5 - absDiff,
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        <div style={{ 
                          width: '70px', height: '70px', borderRadius: '50%', 
                          background: absDiff === 0 ? (f.ar !== 'none' ? 'linear-gradient(45deg, #10b981, #3b82f6)' : 'linear-gradient(45deg, #f09433, #bc1888)') : 'rgba(255,255,255,0.8)',
                          padding: absDiff === 0 ? '4px' : '2px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                        }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                             {f.ar === 'beauty-skin' && "✨"}
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

      {appState === 'PREVIEW' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <img src={imageSrc as string} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
            {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            
            <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', justifyContent: 'space-around', padding: '0 20%', zIndex: 20 }}>
               <button onClick={resetSession} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#ef4444', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(239,68,68,0.5)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <span style={{ fontSize: '30px', color: 'white' }}>✖</span>
               </button>
               <button onClick={approvePhoto} style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#10b981', border: '4px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(16,185,129,0.5)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <span style={{ fontSize: '35px', color: 'white' }}>✔</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'FRAME_SELECT' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.4s' }}>
          
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Select a Frame</h2>
            <p style={{ color: '#888', margin: '5px 0 0 0' }}>Add a graphic overlay to your masterpiece.</p>
          </div>

          <div style={{ display: 'flex', flexGrow: 1, padding: '0 20px 20px 20px', gap: '20px', overflow: 'hidden' }}>
            
            {/* Left Sidebar Frames */}
            <div style={{ flex: '0 0 100px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '5px' }}>
               {FRAMES.slice(0, 2).map(f => (
                 <button key={f.id} onClick={() => setSelectedFrameId(f.id)} style={{ width: '100%', height: '140px', backgroundColor: selectedFrameId === f.id ? '#3b82f6' : '#27272a', border: selectedFrameId === f.id ? '3px solid white' : 'none', borderRadius: '15px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                   <div style={{ width: '40px', height: '60px', backgroundColor: '#444', borderRadius: '4px', marginBottom: '10px', border: f.id !== 'none' ? '2px solid white' : 'none', position: 'relative' }}>
                      {f.id !== 'none' && <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', height: '10px', backgroundColor: '#aaa', borderRadius: '2px' }}></div>}
                   </div>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{f.name}</span>
                 </button>
               ))}
            </div>

            {/* Center Image Preview */}
            <div style={{ flexGrow: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <div style={{ position: 'relative', height: '100%', maxWidth: '100%', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', backgroundColor: '#000' }}>
                  <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                  {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  
                  {selectedFrameId === 'insta' && <FrameInsta />}
                  {selectedFrameId === 'social' && <FrameSocial />}
                  {selectedFrameId === 'magazine' && <FrameMagazine />}
               </div>
            </div>

            {/* Right Sidebar Frames */}
            <div style={{ flex: '0 0 100px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingLeft: '5px' }}>
               {FRAMES.slice(2, 4).map(f => (
                 <button key={f.id} onClick={() => setSelectedFrameId(f.id)} style={{ width: '100%', height: '140px', backgroundColor: selectedFrameId === f.id ? '#3b82f6' : '#27272a', border: selectedFrameId === f.id ? '3px solid white' : 'none', borderRadius: '15px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
                   <div style={{ width: '40px', height: '60px', backgroundColor: '#444', borderRadius: '4px', marginBottom: '10px', border: f.id !== 'none' ? '2px solid white' : 'none', position: 'relative' }}>
                      {f.id !== 'none' && <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', height: '10px', backgroundColor: '#aaa', borderRadius: '2px' }}></div>}
                   </div>
                   <span style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>{f.name}</span>
                 </button>
               ))}
            </div>
          </div>

          <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
             <button onClick={finishSession} style={{ padding: '20px 80px', fontSize: '1.4rem', borderRadius: '50px', backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 5px 20px rgba(255,255,255,0.3)' }}>
               Export Final Photo
             </button>
          </div>
        </div>
      )}

      {appState === 'FINAL' && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.5s' }}>
          
          <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#10b981' }}>Processing Complete!</h2>

          <div style={{ position: 'relative', height: '60vh', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', backgroundColor: '#000' }}>
            <img src={imageSrc as string} alt="Final" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
            {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            
            {selectedFrameId === 'insta' && <FrameInsta />}
            {selectedFrameId === 'social' && <FrameSocial />}
            {selectedFrameId === 'magazine' && <FrameMagazine />}
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
             <button onClick={resetSession} style={{ padding: '15px 40px', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#27272a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
               Start New Session
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

Write-Host "App.tsx Frame Selection Rewrite Complete!"
