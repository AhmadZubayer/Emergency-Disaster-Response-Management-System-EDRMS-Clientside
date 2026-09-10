'use client';

import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import api from '@/app/lib/useAxios';
import { ENDPOINTS } from '@/app/lib/endpoints';
import ModernButton from '@/components/modernBtn';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

const signUpSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Enter a valid phone number with country code.'),
    password: z
      .string()
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must have 8+ characters with uppercase, lowercase, a number, and a special character.'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-4">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.9 6-15.1Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4.1 2-6.8 2-5.3 0-9.8-3.6-11.4-8.4H5.7v5.3A20.4 20.4 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.5a12.3 12.3 0 0 1 0-7V15H5.7a20 20 0 0 0 0 18l6.9-5.5Z"
      />
      <path
        fill="#EA4335"
        d="M24 12.1c3 0 5.6 1 7.7 3l5.8-5.8A19.4 19.4 0 0 0 24 4 20.4 20.4 0 0 0 5.7 15l6.9 5.5C14.2 15.7 18.7 12.1 24 12.1Z"
      />
    </svg>
  );
}

interface AuthDialogProps {
  onSignIn: (token: string) => void;
}

export default function AuthDialog({ onSignIn }: AuthDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const resetState = () => {
    setErrors({});
    setServerError(null);
  };

  const handleOpenChange = (open: boolean) => {
    if (isLoading) return;
    setIsOpen(open);
    resetState();
    if (open) setIsSignUp(false);
  };

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    resetState();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    resetState();

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData);
    const schema = isSignUp ? signUpSchema : signInSchema;
    const result = schema.safeParse(formValues);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const fieldName = String(issue.path[0]);
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { name, email, phoneNumber, password } = signUpSchema.parse(result.data);
        await api.post(ENDPOINTS.AUTH.REGISTER, { name, email, phoneNumber, password });
        toast.add({
          title: 'Account created',
          description: 'Please check your email to verify your account, then sign in.',
          type: 'success',
        });
        setIsSignUp(false);
      } else {
        const response = await api.post(ENDPOINTS.AUTH.SIGN_IN, result.data);
        const token = response.data?.data?.access_token;
        if (typeof token !== 'string') {
          throw new Error('Sign-in response missing access token.');
        }
        onSignIn(token);
        setIsOpen(false);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        setServerError(
          Array.isArray(message)
            ? message.join(' ')
            : message || 'Authentication failed. Please verify your credentials.'
        );
      } else if (error instanceof Error) {
        setServerError(error.message);
      } else {
        setServerError('Unable to connect. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>Sign in</DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-[420px]" showCloseButton={!isLoading}>
        <Card className="gap-5 rounded-xl py-5 ring-0">
          <CardHeader className="pr-10">
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-base font-semibold">
                {isSignUp ? 'Create your account' : 'Login to your account'}
              </DialogTitle>
              <Button
                type="button"
                variant="link"
                className="h-auto shrink-0 p-0 text-sm"
                disabled={isLoading}
                onClick={toggleMode}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </div>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? 'Enter your details below to create your account'
                : 'Enter your email below to login to your account'}
            </DialogDescription>
          </CardHeader>

          <form key={String(isSignUp)} noValidate onSubmit={handleSubmit} className="space-y-4">
            <CardContent className="space-y-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-center text-xs font-medium text-destructive">
                  {serverError}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-name" className="text-sm">
                    Full name
                  </Label>
                  <Input
                    id="auth-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    disabled={isLoading}
                    className="h-9 text-sm"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="auth-email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  disabled={isLoading}
                  className="h-9 text-sm"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-phone" className="text-sm">
                    Phone number
                  </Label>
                  <Input
                    id="auth-phone"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+8801712345678"
                    disabled={isLoading}
                    className="h-9 text-sm"
                    aria-invalid={!!errors.phoneNumber}
                  />
                  {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="auth-password" className="text-sm">
                    Password
                  </Label>
                  {!isSignUp && (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-sm"
                      onClick={() =>
                        setServerError('Password recovery is not available yet. Please contact support.')
                      }
                    >
                      Forgot your password?
                    </Button>
                  )}
                </div>
                <Input
                  id="auth-password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={isLoading}
                  className="h-9 text-sm"
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                {isSignUp && !errors.password && (
                  <p className="text-xs text-muted-foreground">
                    8+ characters with uppercase, lowercase, a number and a symbol (@$!%*?&).
                  </p>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="auth-confirm-password" className="text-sm">
                    Confirm password
                  </Label>
                  <Input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-9 text-sm"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t bg-muted/20 pt-4">
              <div className="flex w-full justify-center">
                <ModernButton
                  type="submit"
                  disabled={isLoading}
                  text={
                    isLoading
                      ? isSignUp
                        ? 'Creating account...'
                        : 'Signing in...'
                      : isSignUp
                        ? 'Sign Up'
                        : 'Login'
                  }
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full text-sm"
                disabled={isLoading}
                onClick={() =>
                  setServerError('Google sign-in is not available yet. Please use email and password.')
                }
              >
                <GoogleLogo />
                {isSignUp ? 'Sign up with Google' : 'Login with Google'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

