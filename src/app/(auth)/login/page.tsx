import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const loginIllustration = PlaceHolderImages.find(
    (img) => img.id === 'login-illustration'
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-6xl rounded-2xl shadow-2xl bg-card overflow-hidden grid md:grid-cols-2">
        <div className="relative hidden h-full md:block">
          {loginIllustration && (
            <Image
              src={loginIllustration.imageUrl}
              alt={loginIllustration.description}
              fill
              className="object-cover"
              data-ai-hint={loginIllustration.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
