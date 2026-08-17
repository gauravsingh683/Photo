import { useRef, useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

// Define the global window types for MediaPipe
declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
    FACEMESH_LIPS: any;
    FACEMESH_LEFT_EYE: any;
    FACEMESH_RIGHT_EYE: any;
    FACEMESH_FACE_OVAL: any;
  }
}

export const ARCamera = forwardRef(({ filterCSS }: { filterCSS: string }, ref) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const filterRef = useRef(filterCSS);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const faceMeshRef = useRef<any>(null);
  const isFaceMeshLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    filterRef.current = filterCSS;
  }, [filterCSS]);

  useImperativeHandle(ref, () => ({
    getScreenshot: () => {
      if (canvasRef.current) {
        // High quality JPEG output
        return canvasRef.current.toDataURL('image/jpeg', 1.0);
      }
      return null;
    }
  }));

  // Toggle diagnostics with 'D' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'd') {
        setShowDiagnostics(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  const handleDevices = useCallback((deviceList: MediaDeviceInfo[]) => {
    const videoDevices = deviceList.filter(d => d.kind === 'videoinput');
    setDevices(videoDevices);
    
    // If the user has already manually selected a connected camera, do not override it
    if (selectedDeviceId && videoDevices.some(d => d.deviceId === selectedDeviceId)) {
      return;
    }
    
    // Auto-select DSLR/Canon or virtual webcam if found
    const canonDevice = videoDevices.find(d => {
      const label = d.label.toLowerCase();
      return label.includes('canon') || label.includes('eos') || label.includes('webcam utility') || label.includes('virtual');
    });
    
    if (canonDevice) {
      setSelectedDeviceId(canonDevice.deviceId);
      console.log("Auto-selected DSLR/Virtual camera:", canonDevice.label);
    } else if (videoDevices.length > 0) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  // Listen to device changes (e.g. plugging/unplugging DSLR)
  useEffect(() => {
    const handleDeviceChange = () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    };
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [handleDevices]);

  // Initialize MediaPipe FaceMesh
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    
    if (!window.FaceMesh) {
      console.warn("MediaPipe FaceMesh script not loaded yet");
      return;
    }

    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results: any) => {
      const canvasCtx = canvasRef.current?.getContext('2d');
      const offCtx = offscreenCanvasRef.current?.getContext('2d');
      
      if (!canvasCtx || !offCtx || !canvasRef.current || !offscreenCanvasRef.current) return;
      
      const targetWidth = results.image.height;
      const targetHeight = results.image.width;
      
      if (canvasRef.current!.width !== targetWidth) {
        canvasRef.current!.width = targetWidth;
        canvasRef.current!.height = targetHeight;
        offscreenCanvasRef.current.width = results.image.width;
        offscreenCanvasRef.current.height = results.image.height;
      }

      canvasCtx.save();
      // Mirror image
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-targetWidth, 0);

      // Rotate 90 degrees clockwise
      canvasCtx.translate(targetWidth / 2, targetHeight / 2);
      canvasCtx.rotate(90 * Math.PI / 180);

      // Draw base image with filter
      const currentFilter = filterRef.current;
      canvasCtx.filter = currentFilter === 'none' ? 'none' : currentFilter;
      canvasCtx.drawImage(results.image, -targetHeight / 2, -targetWidth / 2, targetHeight, targetWidth);
      
      // Face Smoothing
      if (results.multiFaceLandmarks && (currentFilter.includes('brightness') || currentFilter.includes('blur'))) {
        for (const landmarks of results.multiFaceLandmarks) {
          offCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          
          offCtx.filter = 'blur(4px)';
          offCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
          offCtx.filter = 'none';
          
          if (window.FACEMESH_FACE_OVAL) {
            offCtx.globalCompositeOperation = 'destination-in';
            offCtx.beginPath();
            for (let i = 0; i < window.FACEMESH_FACE_OVAL.length; i++) {
              const index = window.FACEMESH_FACE_OVAL[i][0];
              const x = landmarks[index].x * canvasRef.current!.width;
              const y = landmarks[index].y * canvasRef.current!.height;
              if (i === 0) offCtx.moveTo(x, y);
              else offCtx.lineTo(x, y);
            }
            offCtx.closePath();
            offCtx.fill();
            
            offCtx.globalCompositeOperation = 'destination-out';
            
            const features = [window.FACEMESH_LEFT_EYE, window.FACEMESH_RIGHT_EYE, window.FACEMESH_LIPS];
            features.forEach(feature => {
              if (!feature) return;
              offCtx.beginPath();
              for (let i = 0; i < feature.length; i++) {
                const index = feature[i][0];
                const x = landmarks[index].x * canvasRef.current!.width;
                const y = landmarks[index].y * canvasRef.current!.height;
                if (i === 0) offCtx.moveTo(x, y);
                else offCtx.lineTo(x, y);
              }
              offCtx.fill();
            });
            
            canvasCtx.globalAlpha = 0.5; // 50% opacity smoothing
            canvasCtx.drawImage(offscreenCanvasRef.current, 0, 0);
            canvasCtx.globalAlpha = 1.0;
          }
        }
      }
      
      canvasCtx.restore();
    });

    faceMesh.initialize().then(() => {
      isFaceMeshLoadedRef.current = true;
      console.log("FaceMesh models loaded successfully.");
    });

    faceMeshRef.current = faceMesh;

    return () => {
      if (faceMesh) faceMesh.close();
    };
  }, []);

  // Run custom requestAnimationFrame processing loop
  useEffect(() => {
    let active = true;
    let animationFrameId: number;

    const processFrame = async () => {
      if (!active) return;
      
      try {
        const video = webcamRef.current?.video;
        if (video && video.readyState >= 2) {
          if (video.paused) {
            video.play().catch(e => console.error("Error playing video:", e));
          }
          const needsBeauty = false; // Disabled FaceMesh to prevent CPU lag and support 90-degree camera rotation
          
          if (needsBeauty && isFaceMeshLoadedRef.current && faceMeshRef.current) {
            await faceMeshRef.current.send({ image: video });
          } else {
            // Fast path: bypass ML inference and draw directly
            const canvasCtx = canvasRef.current?.getContext('2d');
            if (canvasCtx && canvasRef.current) {
              const targetWidth = video.videoHeight;
              const targetHeight = video.videoWidth;
              
              if (canvasRef.current.width !== targetWidth || canvasRef.current.height !== targetHeight) {
                canvasRef.current.width = targetWidth;
                canvasRef.current.height = targetHeight;
              }
              
              canvasCtx.save();
              canvasCtx.clearRect(0, 0, targetWidth, targetHeight);
              
              // Mirror the image horizontally
              canvasCtx.scale(-1, 1);
              canvasCtx.translate(-targetWidth, 0);
              
              // Rotate 90 degrees clockwise
              canvasCtx.translate(targetWidth / 2, targetHeight / 2);
              canvasCtx.rotate(90 * Math.PI / 180);
              
              canvasCtx.filter = currentFilter === 'none' ? 'none' : currentFilter;
              canvasCtx.drawImage(video, -targetHeight / 2, -targetWidth / 2, targetHeight, targetWidth);
              
              canvasCtx.restore();

              // Draw debug indicator in screen coordinates
              canvasCtx.fillStyle = "#ff0000";
              canvasCtx.font = "bold 24px monospace";
              canvasCtx.fillText("DEBUG: Rotated 90 deg", 20, 40);
            }
          }
        }
      } catch (err) {
        console.error("Error in camera frame processing:", err);
      }
      
      if (active) {
        animationFrameId = requestAnimationFrame(processFrame);
      }
    };

    animationFrameId = requestAnimationFrame(processFrame);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [selectedDeviceId]);

  const switchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
    console.log("Switched to camera:", devices[nextIndex].label);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Webcam
        key={selectedDeviceId || 'default'}
        audio={false}
        ref={webcamRef}
        style={{ width: '1px', height: '1px', opacity: 0, position: 'absolute', pointerEvents: 'none' }}
        onUserMediaError={(err) => {
          console.error("Webcam error:", err);
          setWebcamError(String(err));
        }}
        onUserMedia={() => {
          setWebcamError(null);
        }}
        videoConstraints={
          selectedDeviceId
            ? { deviceId: selectedDeviceId, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }
        }
      />
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      
      {showDiagnostics && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0,0,0,0.85)',
          color: '#00ff00',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 9999,
          maxWidth: '400px',
          textAlign: 'left',
          lineHeight: '1.4'
        }}>
          <strong>Diagnostic Info (Press 'D' to hide):</strong><br/>
          FaceMesh: {isFaceMeshLoadedRef.current ? 'Loaded' : 'Loading/Error'}<br/>
          Active ID: {selectedDeviceId || 'Default'}<br/>
          Webcam state: {webcamRef.current?.video ? `Initialized (ReadyState: ${webcamRef.current.video.readyState})` : 'Not initialized'}<br/>
          Video dimensions: {webcamRef.current?.video ? `${webcamRef.current.video.videoWidth}x${webcamRef.current.video.videoHeight}` : 'N/A'}<br/>
          Webcam Error: {webcamError || 'None'}<br/>
          Devices found: {devices.length}<br/>
          {devices.map((d, i) => (
            <div key={d.deviceId} style={{ paddingLeft: '10px', color: d.deviceId === selectedDeviceId ? '#fff' : '#888' }}>
              {i+1}. {d.label || 'Unnamed'} ({d.deviceId.substring(0,6)}...)
            </div>
          ))}
        </div>
      )}

      {devices.length > 1 && (
        <button
          onClick={switchCamera}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            padding: '10px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'sans-serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          🔄 Switch Camera
        </button>
      )}
    </div>
  );
});
