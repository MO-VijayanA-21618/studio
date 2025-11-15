'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ta } from '@/lib/constants/ta';
import { Logo } from '../icons/Logo';
import { signIn } from '@/lib/firebase/auth';

const formSchema = z.object({
  email: z.string().email('தவறான மின்னஞ்சல்'),
  password: z.string().min(6, 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் கொண்டிருக்க வேண்டும்'),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      await signIn(values.email, values.password);
      toast({
        title: "வெற்றிகரமாக உள்நுழைந்துள்ளீர்கள்",
        description: ta.login.welcome,
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "உள்நுழைவு தோல்வி",
        description: error.message || "தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo className="mb-2 h-14 w-auto"/>
        <h1 className="font-headline text-3xl font-bold text-primary">
          {ta.login.welcome}
        </h1>
        <p className="text-muted-foreground">{ta.login.title}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ta.login.emailLabel}</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ta.login.passwordLabel}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {ta.login.loggingIn}
              </>
            ) : (
              ta.login.loginButton
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
