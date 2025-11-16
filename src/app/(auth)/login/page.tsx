'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LoginPage() {
  const loginImage = PlaceHolderImages.find(p => p.id === 'login-illustration');
  const loginImageUrl = loginImage ? loginImage.imageUrl : "https://picsum.photos/seed/login/1080/1920";
  const imageHint = loginImage ? loginImage.imageHint : "abstract gradient";
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-6xl rounded-2xl shadow-2xl bg-card overflow-hidden grid md:grid-cols-2">
        <div className="relative hidden h-full md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={loginImageUrl}
            alt="Decorative background image"
            className="object-cover w-full h-full"
            data-ai-hint={imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
