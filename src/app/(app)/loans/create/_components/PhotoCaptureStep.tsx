'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { compressImage } from '@/lib/utils/image-compression';

export function PhotoCaptureStep() {
  const { setValue, watch } = useFormContext();
  const [customerPhoto, setCustomerPhoto] = useState<string | null>(watch('customerPhoto'));
  const loanItems = watch('loanItems') || [];
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureType, setCaptureType] = useState<'customer' | null>(null);
  const [captureItemIndex, setCaptureItemIndex] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async (type: 'customer', itemIndex?: number) => {
    setCaptureType(type);
    setCaptureItemIndex(itemIndex || null);
    setIsCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    if (captureType === 'customer') {
      const compressedPhoto = await compressImage(photoDataUrl, 100);
      setCustomerPhoto(compressedPhoto);
      setValue('customerPhoto', compressedPhoto);
    }
    
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setCaptureType(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'customer') => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedPhoto = await compressImage(file, 100);
      setCustomerPhoto(compressedPhoto);
      setValue('customerPhoto', compressedPhoto);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };

  const removePhoto = () => {
    setCustomerPhoto(null);
    setValue('customerPhoto', null);
  };

  return (
    <div className="space-y-6">
      {/* Camera View */}
      {isCapturing && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <div className="flex gap-2 mt-4 justify-center">
                <Button onClick={capturePhoto}>Capture</Button>
                <Button variant="outline" onClick={stopCamera}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Photo</CardTitle>
        </CardHeader>
        <CardContent>
          {customerPhoto ? (
            <div className="relative inline-block">
              <img 
                src={customerPhoto} 
                alt="Customer" 
                className="w-32 h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => startCamera('customer')}
                disabled={isCapturing}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'customer')}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about item photos */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            📸 Item photos can be added in the "Gold Items" step for each specific item.
          </p>
        </CardContent>
      </Card>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}