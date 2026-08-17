import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import './index.css';

type AppState = 'WELCOME' | 'FILTER_SELECT' | 'COUNTDOWN' | 'PREVIEW' | 'FRAME_SELECT' | 'FINAL';

const FILTERS = [
  { name: 'Normal', css: 'none', ar: 'none' },
  { name: 'AI Beauty Mode', css: 'brightness(1.05) contrast(0.95)', ar: 'beauty-skin' },
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
  { id: 'polaroid', name: 'Vintage Polaroid' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'vip', name: 'Gold VIP' },
  { id: 'summer', name: 'Summer Vibes' },
  { id: 'cinema', name: 'Cinematic' }
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
        
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let scale = 1, offsetX = 0, offsetY = 0;
        
        if (videoRatio > canvasRatio) {
            scale = canvas.height / video.videoHeight;
            const scaledWidth = video.videoWidth * scale;
            offsetX = (canvas.width - scaledWidth) / 2;
        } else {
            scale = canvas.width / video.videoWidth;
            const scaledHeight = video.videoHeight * scale;
            offsetY = (canvas.height - scaledHeight) / 2;
        }
        
        const p = (index: number) => ({
           x: (landmarks[index].x * video.videoWidth * scale) + offsetX,
           y: (landmarks[index].y * video.videoHeight * scale) + offsetY
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

           ctx.globalAlpha = 0.55;
           ctx.filter = 'blur(10px) brightness(1.25) saturate(1.15)';
           ctx.drawImage(video, offsetX, offsetY, video.videoWidth * scale, video.videoHeight * scale);
           
           ctx.globalAlpha = 1.0;
        }
        else if (selectedFilter.ar === 'glasses-8bit') {
          ctx.translate(centerX, centerY); ctx.rotate(angle);
          const w = eyeDist * 2.8; const h = w * 0.25; const leftX = -w/2; const topY = -h/2;
