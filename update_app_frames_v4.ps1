$ErrorActionPreference = "Continue"

Write-Host "Updating App.tsx with new beautiful frames (Birthday, Wedding, Love, Polaroid)..."

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
  { id: 'social', name: 'Facebook Post' },
  { id: 'magazine', name: 'VOGUE Cover' },
  { id: 'birthday', name: 'Happy Birthday' },
  { id: 'wedding', name: 'Wedding Day' },
  { id: 'love', name: 'Romantic Love' },
  { id: 'polaroid', name: 'Vintage Polaroid' }
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
    setAppState('FILTER_SELECT');
  };

  const approvePhoto = () => {
    setAppState('FRAME_SELECT');
  };

  const finishSession = () => {
    setAppState('FINAL');
  };

  // -------------------------------------------------------------
  // REALISTIC GRAPHIC FRAMES
  // -------------------------------------------------------------

  const FrameInsta = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 5, backgroundColor: 'white' }}>
      <div style={{ height: '56px', display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '0 12px', borderBottom: '1px solid #efefef', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', padding: '2px', marginRight: '10px', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ width: '90%', height: '90%', borderRadius: '50%', backgroundColor: '#ddd' }}></div>
          </div>
        </div>
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#262626', fontWeight: '600', fontSize: '13px', lineHeight: '18px' }}>photo_booth_pro</div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', lineHeight: '15px' }}>Original Audio</div>
        </div>
        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg aria-label="More options" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><circle cx="12" cy="12" r="1.5"></circle><circle cx="6" cy="12" r="1.5"></circle><circle cx="18" cy="12" r="1.5"></circle></svg>
        </div>
      </div>
      <div style={{ flexGrow: 1, backgroundColor: 'transparent', position: 'relative' }}>
         <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
         {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ backgroundColor: '#fff', padding: '12px', borderTop: '1px solid #efefef', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <svg aria-label="Like" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.438-.283-1.791-1.509-4.303-3.752C5.152 14.081 2.5 12.194 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.14 6.14 0 0 0-4.896 2.387 6.142 6.142 0 0 0-4.899-2.387C3.018 1.904 1 4.144 1 9.122c0 3.996 3.12 6.55 5.56 8.727 2.45 2.188 4.24 3.78 4.64 4.098a.86.86 0 0 0 1.6 0c.4-.318 2.19-1.91 4.64-4.098 2.44-2.177 5.56-4.731 5.56-8.727 0-4.978-2.018-7.218-6.208-7.218Z"></path></svg>
            <svg aria-label="Comment" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
            <svg aria-label="Share Post" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
          </div>
          <svg aria-label="Save" fill="#262626" height="24" role="img" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
        </div>
        <div style={{ color: '#262626', fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>1,429 likes</div>
        <div style={{ color: '#262626', fontSize: '13px', marginBottom: '5px' }}><span style={{ fontWeight: '600' }}>photo_booth_pro</span> Having an amazing time at the event! ✨📸 #photobooth</div>
        <div style={{ color: '#8e8e8e', fontSize: '13px' }}>View all 48 comments</div>
      </div>
    </div>
  );

  const FrameSocial = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', zIndex: 5, backgroundColor: '#f0f2f5' }}>
      <div style={{ backgroundColor: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
         <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1877F2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginRight: '10px' }}>P</div>
         <div style={{ flexGrow: 1 }}>
           <div style={{ color: '#050505', fontWeight: '600', fontSize: '15px', lineHeight: '1.2' }}>Photo Booth User</div>
           <div style={{ color: '#65676B', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
             Just now • 
             <svg viewBox="0 0 16 16" width="12" height="12" fill="#65676B"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.872 10.957c-.126-.41-.532-.861-1.077-.861h-.445v-.748c0-.46-.37-.833-.827-.833H7.077v-1.666h1.25a.833.833 0 0 0 .834-.833V5.183h.416c.46 0 .834-.373.834-.833 0-.154-.042-.3-.12-.423A6.345 6.345 0 0 1 11.872 10.957zM6.244 3.791c.078.123.12.269.12.423v.833c0 .46-.374.833-.834.833H4.167v2.5h2.083c.46 0 .833.373.833.833v2.084H5.417a.833.833 0 0 0-.834.833v.38a6.331 6.331 0 0 1-2.91-5.327 6.31 6.31 0 0 1 4.571-3.392z"></path></svg>
           </div>
         </div>
         <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 20 20" width="20" height="20" fill="#65676B"><path d="M10 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path></svg>
         </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '0 16px 12px 16px', color: '#050505', fontSize: '15px', width: '100%', boxSizing: 'border-box' }}>
         Checking out this awesome new AR filter at the photo booth! 🚀✨
      </div>
      <div style={{ flexGrow: 1, backgroundColor: 'transparent', position: 'relative' }}>
         <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
         {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ backgroundColor: 'white', padding: '10px 16px', width: '100%', boxSizing: 'border-box' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', color: '#65676B', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid #CED0D4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
               <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg viewBox="0 0 16 16" width="10" height="10" fill="white"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.8 6.4h-2.3l.3-1.6c.1-.5-.3-.9-.8-.9h-.4L7.3 6.4H5.6v5.6h4.5c.4 0 .8-.3.9-.7l.9-3.7c.1-.6-.3-1.2-1.1-1.2z"></path></svg></div>
               <span>1.2K</span>
            </div>
            <div>48 Comments • 12 Shares</div>
         </div>
         <div style={{ display: 'flex', justifyContent: 'space-around', color: '#65676B', fontWeight: '600', fontSize: '14px', paddingTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
               Like
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
               Comment
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" x2="21" y1="3" y2="3"></line></svg>
               Share
            </div>
         </div>
      </div>
    </div>
  );

  const FrameMagazine = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '15px solid white', boxSizing: 'border-box', zIndex: 5, display: 'flex', flexDirection: 'column' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', filter: selectedFilter.css, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ width: '100%', textAlign: 'center', paddingTop: '20px' }}>
         <h1 style={{ fontFamily: 'Times New Roman, serif', fontSize: '80px', margin: 0, color: 'rgba(255,255,255,0.95)', textShadow: '0 5px 15px rgba(0,0,0,0.8)', letterSpacing: '8px', fontWeight: 'normal' }}>VOGUE</h1>
       </div>
       <div style={{ flexGrow: 1, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20px', bottom: '40px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.9)', maxWidth: '150px' }}>
             <h3 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>SUMMER CHIC</h3>
             <p style={{ fontSize: '12px', margin: 0 }}>The ultimate guide to looking flawless this season.</p>
          </div>
          <div style={{ position: 'absolute', right: '20px', top: '40px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.9)', maxWidth: '150px', textAlign: 'right' }}>
             <h3 style={{ fontSize: '18px', margin: '0 0 5px 0' }}>EXCLUSIVE</h3>
             <p style={{ fontSize: '12px', margin: 0 }}>Behind the scenes with the star of the year.</p>
          </div>
          <div style={{ position: 'absolute', right: '20px', bottom: '40px', color: '#ffcc00', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
             <div style={{ fontSize: '30px', fontWeight: 'bold' }}>2026</div>
             <div style={{ fontSize: '15px', letterSpacing: '4px', textAlign: 'right' }}>ISSUE</div>
          </div>
       </div>
    </div>
  );

  const FrameBirthday = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '15px solid #FF6B6B', boxSizing: 'border-box', zIndex: 5, display: 'flex', flexDirection: 'column' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', filter: selectedFilter.css, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '50px', transform: 'rotate(-15deg)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>🎈</div>
       <div style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '60px', transform: 'rotate(10deg)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>🎉</div>
       <div style={{ position: 'absolute', bottom: '20px', left: '20px', fontSize: '45px', transform: 'rotate(5deg)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>🎁</div>
       <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '55px', transform: 'rotate(-20deg)', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>🎂</div>

       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Comic Sans MS", "Bubblegum Sans", cursive', fontSize: '55px', margin: 0, color: '#FFD166', textShadow: '4px 4px 0 #FF6B6B, 0 5px 15px rgba(0,0,0,0.5)', letterSpacing: '2px' }}>Happy Birthday!</h1>
       </div>
    </div>
  );

  const FrameWedding = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '15px solid rgba(255,255,255,0.9)', boxSizing: 'border-box', zIndex: 5 }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', filter: selectedFilter.css, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px solid #D4AF37', borderRadius: '10px' }}></div>
       <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: '1px solid #D4AF37', borderRadius: '15px' }}></div>
       
       <div style={{ position: 'absolute', top: '40px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Great Vibes", "Brush Script MT", cursive', fontSize: '60px', margin: 0, color: '#fff', textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>Our Special Day</h1>
       </div>
       <div style={{ position: 'absolute', bottom: '40px', width: '100%', textAlign: 'center' }}>
         <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', margin: 0, color: '#D4AF37', letterSpacing: '4px', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>JUST MARRIED</h2>
       </div>
    </div>
  );

  const FrameLove = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', border: '15px solid #ff4d6d', boxSizing: 'border-box', zIndex: 5, boxShadow: 'inset 0 0 50px rgba(255,0,100,0.5)' }}>
       <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', filter: selectedFilter.css, zIndex: -2 }} />
       {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: '-15px', left: '-15px', width: 'calc(100% + 30px)', height: 'calc(100% + 30px)', objectFit: 'cover', zIndex: -1 }} />}
       
       <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '40px', opacity: 0.8 }}>💖</div>
       <div style={{ position: 'absolute', top: '50px', right: '30px', fontSize: '30px', opacity: 0.9 }}>💕</div>
       <div style={{ position: 'absolute', top: '150px', left: '40px', fontSize: '25px', opacity: 0.7 }}>💓</div>
       <div style={{ position: 'absolute', bottom: '150px', right: '40px', fontSize: '35px', opacity: 0.8 }}>💞</div>
       <div style={{ position: 'absolute', bottom: '50px', left: '30px', fontSize: '45px', opacity: 0.9 }}>💘</div>
       
       <div style={{ position: 'absolute', bottom: '60px', width: '100%', textAlign: 'center' }}>
         <h1 style={{ fontFamily: '"Dancing Script", cursive, "Times New Roman"', fontSize: '70px', margin: 0, color: '#fff', textShadow: '0 0 20px #ff4d6d, 0 5px 15px rgba(0,0,0,0.8)' }}>True Love</h1>
       </div>
    </div>
  );

  const FramePolaroid = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', backgroundColor: '#fdfdfd', padding: '20px 20px 100px 20px', boxSizing: 'border-box', zIndex: 5, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)' }}>
       <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
          {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
       </div>
       <div style={{ position: 'absolute', bottom: '30px', width: '100%', textAlign: 'center', left: 0 }}>
         <h1 style={{ fontFamily: '"Caveat", "Indie Flower", cursive, sans-serif', fontSize: '40px', margin: 0, color: '#2c3e50', transform: 'rotate(-2deg)' }}>Making Memories... ✨</h1>
       </div>
    </div>
  );

  // Group frames into two columns
  const leftFrames = FRAMES.slice(0, Math.ceil(FRAMES.length / 2));
  const rightFrames = FRAMES.slice(Math.ceil(FRAMES.length / 2));

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
            <img src={imageSrc as string} alt="Captured" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
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
            <div className="no-scrollbar" style={{ flex: '0 0 110px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '5px', paddingBottom: '20px' }}>
               {leftFrames.map(f => (
                 <button key={f.id} onClick={() => setSelectedFrameId(f.id)} style={{ width: '100%', minHeight: '140px', backgroundColor: selectedFrameId === f.id ? '#3b82f6' : '#27272a', border: selectedFrameId === f.id ? '3px solid white' : 'none', borderRadius: '15px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
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
                  
                  {/* Default Base Image (Only shows if no special frame layout handles the image) */}
                  {selectedFrameId === 'none' && (
                     <>
                        <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                        {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                     </>
                  )}
                  
                  {selectedFrameId === 'insta' && <FrameInsta />}
                  {selectedFrameId === 'social' && <FrameSocial />}
                  {selectedFrameId === 'magazine' && <FrameMagazine />}
                  {selectedFrameId === 'birthday' && <FrameBirthday />}
                  {selectedFrameId === 'wedding' && <FrameWedding />}
                  {selectedFrameId === 'love' && <FrameLove />}
                  {selectedFrameId === 'polaroid' && <FramePolaroid />}
               </div>
            </div>

            {/* Right Sidebar Frames */}
            <div className="no-scrollbar" style={{ flex: '0 0 110px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingLeft: '5px', paddingBottom: '20px' }}>
               {rightFrames.map(f => (
                 <button key={f.id} onClick={() => setSelectedFrameId(f.id)} style={{ width: '100%', minHeight: '140px', backgroundColor: selectedFrameId === f.id ? '#3b82f6' : '#27272a', border: selectedFrameId === f.id ? '3px solid white' : 'none', borderRadius: '15px', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
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
            {selectedFrameId === 'none' && (
               <>
                  <img src={imageSrc as string} alt="Base" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: selectedFilter.css }} />
                  {arOverlaySrc && <img src={arOverlaySrc} alt="AR" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
               </>
            )}
            
            {selectedFrameId === 'insta' && <FrameInsta />}
            {selectedFrameId === 'social' && <FrameSocial />}
            {selectedFrameId === 'magazine' && <FrameMagazine />}
            {selectedFrameId === 'birthday' && <FrameBirthday />}
            {selectedFrameId === 'wedding' && <FrameWedding />}
            {selectedFrameId === 'love' && <FrameLove />}
            {selectedFrameId === 'polaroid' && <FramePolaroid />}
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

# Need to add CSS to hide scrollbar but allow scrolling
$cssCode = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
'@
Set-Content -Path "c:\Photo\booth-app\src\index.css" -Value $cssCode

Write-Host "Update Complete!"
