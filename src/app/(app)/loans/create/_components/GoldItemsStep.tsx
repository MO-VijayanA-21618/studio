'use client';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useState, useRef } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Camera, Upload, X } from 'lucide-react';
import { ta } from '@/lib/constants/ta';
import { Card, CardContent } from '@/components/ui/card';
import { compressImage } from '@/lib/utils/image-compression';

export function GoldItemsStep() {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'loanItems',
  });
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureItemIndex, setCaptureItemIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const startCamera = async (itemIndex: number) => {
    setCaptureItemIndex(itemIndex);
    setIsCapturing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
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
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || captureItemIndex === null) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0);
    
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const compressedPhoto = await compressImage(photoDataUrl, 100);
    setValue(`loanItems.${captureItemIndex}.photo`, compressedPhoto);
    
    stopCamera();
  };
  
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
    setCaptureItemIndex(null);
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, itemIndex: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const compressedPhoto = await compressImage(file, 100);
      setValue(`loanItems.${itemIndex}.photo`, compressedPhoto);
    } catch (error) {
      console.error('Error compressing image:', error);
    }
  };
  
  const removeItemPhoto = (itemIndex: number) => {
    setValue(`loanItems.${itemIndex}.photo`, null);
  };

  return (
    <div className="space-y-6">
      {fields.map((item, index) => (
        <Card key={item.id} className="relative pt-6">
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
                control={control}
                name={`loanItems.${index}.name`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.itemName}</FormLabel>
                    <FormControl>
                    <Input placeholder="செயின், வளையல்..." {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`loanItems.${index}.weight`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.weight}</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="10.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={control}
                name={`loanItems.${index}.purity`}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{ta.createLoan.purity}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="தூய்மை" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="24">24K</SelectItem>
                            <SelectItem value="22">22K</SelectItem>
                            <SelectItem value="18">18K</SelectItem>
                            <SelectItem value="14">14K</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            
            {/* Item Photo Section */}
            <div className="col-span-full mt-4">
              <FormLabel>Item Photo</FormLabel>
              <div className="mt-2">
                {watch(`loanItems.${index}.photo`) ? (
                  <div className="relative inline-block">
                    <img 
                      src={watch(`loanItems.${index}.photo`)} 
                      alt={`Item ${index + 1}`} 
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeItemPhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => startCamera(index)}
                      disabled={isCapturing}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      Take Photo
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleFileUpload(e as any, index);
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </div>
            </CardContent>
            {fields.length > 1 && (
                <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 text-destructive hover:bg-destructive/10"
                onClick={() => remove(index)}
                >
                <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', weight: 0, purity: '22', photo: null })}
      >
        {ta.createLoan.addGoldItem}
      </Button>
      
      {/* Camera View */}
      {isCapturing && (
        <Card className="fixed inset-0 z-50 bg-background">
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md rounded-lg"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={capturePhoto}>Capture</Button>
              <Button variant="outline" onClick={stopCamera}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
