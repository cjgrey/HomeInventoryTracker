// Modern barcode scanning using QuaggaJS
let quagga: any = null;
let currentStream: MediaStream | null = null;

// Dynamically import QuaggaJS
async function loadQuagga() {
  if (quagga) return quagga;
  
  try {
    const QuaggaModule = await import('quagga');
    quagga = QuaggaModule.default;
    return quagga;
  } catch (error) {
    console.error("Failed to load barcode scanner:", error);
    throw new Error("Barcode scanner not available");
  }
}

export async function initCamera(
  videoElement: HTMLVideoElement,
  onScanSuccess: (data: string) => void,
  onScanError: (error: string) => void
): Promise<() => void> {
  try {
    // Check if camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported by this browser");
    }

    // Get camera stream
    currentStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // Use back camera
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    });

    videoElement.srcObject = currentStream;
    await videoElement.play();

    // Load and configure QuaggaJS
    await loadQuagga();
    
    return new Promise((resolve, reject) => {
      quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoElement,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        },
        locate: true
      }, (err: any) => {
        if (err) {
          onScanError("Failed to initialize barcode scanner");
          reject(err);
          return;
        }

        quagga.onDetected((result: any) => {
          const code = result.codeResult.code;
          if (code && code.length > 0) {
            onScanSuccess(code);
          }
        });

        resolve(() => cleanup());
      });
    });

  } catch (error) {
    onScanError(error instanceof Error ? error.message : "Failed to access camera");
    throw error;
  }
}

export function startScanning() {
  if (quagga) {
    quagga.start();
  }
}

export function stopScanning() {
  if (quagga) {
    quagga.stop();
  }
}

export function setFlashlight(enabled: boolean) {
  if (currentStream) {
    const track = currentStream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      track.applyConstraints({
        advanced: [{ torch: enabled } as any]
      }).catch(() => {
        // Flashlight not supported, ignore error
      });
    }
  }
}

function cleanup() {
  stopScanning();
  
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  
  if (quagga) {
    quagga.offDetected();
  }
}

// Alternative simple implementation using device camera
export async function capturePhoto(): Promise<string> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    // Stop the stream
    stream.getTracks().forEach(track => track.stop());

    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (error) {
    throw new Error("Failed to capture photo");
  }
}
