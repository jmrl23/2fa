'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { signInUser } from '@/schemas/user';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export default function LoginPage() {
  const { login } = useAuth();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signInUser>>({
    resolver: zodResolver(signInUser),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      values: z.infer<typeof signInUser> & { recaptchaToken: string },
    ) => {
      const response = await api.post('/users/sign-in', values);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.data);
      toast.success('Logged in successfully');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage =
        typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : 'Failed to login';
      toast.error(errorMessage);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    },
  });

  async function onSubmit(values: z.infer<typeof signInUser>) {
    if (!recaptchaToken) {
      toast.error('Please complete the reCAPTCHA');
      return;
    }
    mutation.mutate({ ...values, recaptchaToken });
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-background p-4'>
      <Card className='w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent'>
            Welcome Back
          </CardTitle>
          <CardDescription className='text-center'>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='johndoe'
                        {...field}
                        value={field.value ?? ''}
                        className='bg-background/50'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='••••••'
                        {...field}
                        value={field.value ?? ''}
                        className='bg-background/50'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-center'>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                  theme='dark'
                  onChange={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken(null)}
                />
              </div>
              <Button
                type='submit'
                className='w-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/25'
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>
            Don&apos;t have an account?{' '}
            <Link
              href='/register'
              className='text-primary hover:underline font-medium'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
