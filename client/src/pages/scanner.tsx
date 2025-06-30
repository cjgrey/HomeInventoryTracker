import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CameraScanner from "@/components/camera-scanner";
import { 
  Camera, 
  QrCode, 
  ArrowLeft, 
  Check, 
  X,
  AlertCircle,
  Flashlight,
  FlashlightOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Scanner() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const handleScanSuccess = (data: string) => {
    setScannedData(data);
    setIsScanning(false);
    toast({
      title: "Barcode scanned successfully",
      description: `Found: ${data}`,
    });
  };

  const handleScanError = (error: string) => {
    setError(error);
    setIsScanning(false);
    toast({
      title: "Scan failed",
      description: error,
      variant: "destructive",
    });
  };

  const handleUseScannedData = () => {
    if (scannedData) {
      // Navigate to add item page with barcode pre-filled
      const encodedBarcode = encodeURIComponent(scannedData);
      setLocation(`/add-item?barcode=${encodedBarcode}`);
    }
  };

  const handleStartScanning = () => {
    setError(null);
    setScannedData(null);
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">Barcode Scanner</h1>
          <p className="text-sm text-muted-foreground">Scan item barcodes or QR codes</p>
        </div>

        {isScanning && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFlash}
            className="p-2"
          >
            {flashEnabled ? (
              <FlashlightOff className="w-4 h-4" />
            ) : (
              <Flashlight className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Scanner Interface */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {isScanning ? (
              <CameraScanner
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
                flashEnabled={flashEnabled}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 p-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">Ready to Scan</h3>
                  <p className="text-sm text-muted-foreground">
                    Position the barcode or QR code within the camera frame
                  </p>
                </div>
              </div>
            )}
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-primary/50 rounded-lg relative">
                  <div className="absolute inset-0 border-2 border-primary animate-pulse rounded-lg"></div>
                  {/* Corner indicators */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="space-y-4">
        {!isScanning && !scannedData && !error && (
          <Button 
            onClick={handleStartScanning}
            className="w-full h-12"
            disabled={!hasCamera}
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Scanning
          </Button>
        )}

        {isScanning && (
          <Button 
            onClick={handleStopScanning}
            variant="outline"
            className="w-full h-12"
          >
            <X className="w-5 h-5 mr-2" />
            Stop Scanning
          </Button>
        )}

        {!hasCamera && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Camera access is required for barcode scanning. Please enable camera permissions and try again.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Scanned Result */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <Check className="w-5 h-5 mr-2" />
              Scan Successful
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Scanned Data:</p>
              <p className="font-mono text-foreground break-all">{scannedData}</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setScannedData(null);
                  setError(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Scan Again
              </Button>
              <Button
                onClick={handleUseScannedData}
                className="flex-1"
              >
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Scanning Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Hold your device steady and keep the barcode in focus</li>
            <li>• Ensure good lighting or use the flash button</li>
            <li>• Try different angles if the scan doesn't work immediately</li>
            <li>• Most 1D barcodes and QR codes are supported</li>
            <li>• You can also manually enter barcodes when adding items</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
