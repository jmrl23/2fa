'use client';

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
import { signUpUser } from '@/schemas/user';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = signUpUser
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SignupPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      values: z.infer<typeof formSchema> & { recaptchaToken: string },
    ) => {
      const { username, password, confirmPassword } = values;
      const response = await api.post('/users', {
        username,
        password,
        confirmPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully. Please login.');
      router.push('/login');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage =
        typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : 'Failed to create account';
      toast.error(errorMessage);
      recaptchaRef.current?.reset();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      toast.error('Please complete the reCAPTCHA');
      return;
    }
    mutation.mutate({ ...values, recaptchaToken: token });
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-background p-4'>
      <Card className='w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent'>
            Create Account
          </CardTitle>
          <CardDescription className='text-center'>
            Sign up to start securing your accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => form.handleSubmit(onSubmit)(e)}
              className='space-y-4'
            >
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
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
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
                />
              </div>
              <Button
                type='submit'
                className='w-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/25 mt-2'
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-primary hover:underline font-medium'
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
