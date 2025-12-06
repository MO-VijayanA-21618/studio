export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { LoginForm } from '@/components/auth/LoginForm';
import loginImage from '@/lib/image1.png';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-6xl rounded-2xl shadow-2xl bg-card overflow-hidden grid md:grid-cols-2">
        <div className="relative hidden h-full md:block">
          <Image
            src={loginImage}
            alt="Login Background"
            fill
            className="object-cover"
            priority
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
