'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginIllustration } from '@/components/icons/LoginIllustration';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-card rounded-2xl shadow-2xl">
          <LoginIllustration className="w-24 h-24 mb-6 text-primary" />
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
