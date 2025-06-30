import { useEffect, useRef, useState } from "react";
import { initCamera, startScanning, stopScanning, setFlashlight } from "@/lib/camera";

interface CameraScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
  flashEnabled?: boolean;
}

export default function CameraScanner({ 
  onScanSuccess, 
  onScanError, 
  flashEnabled = false 
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const initializeCamera = async () => {
      try {
        if (!videoRef.current) return;
        
        cleanup = await initCamera(videoRef.current, onScanSuccess, onScanError);
        setIsInitialized(true);
        startScanning();
      } catch (error) {
        onScanError(error instanceof Error ? error.message : "Failed to initialize camera");
      }
    };

    initializeCamera();

    return () => {
      stopScanning();
      if (cleanup) {
        cleanup();
      }
    };
  }, [onScanSuccess, onScanError]);

  useEffect(() => {
    if (isInitialized) {
      setFlashlight(flashEnabled);
    }
  }, [flashEnabled, isInitialized]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
}
