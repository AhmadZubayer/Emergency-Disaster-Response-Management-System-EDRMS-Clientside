'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ModernButton from '@/components/modernBtn';
import { signUpSchema } from '@/app/lib/validations/auth';
import { useAuth } from '@/app/hooks/useAuth';

const GoogleIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.19 0 10.03 0 12s.46 3.81 1.26 5.42l4.02-3.13z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

const SignUpForm = () => {
  const { registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = signUpSchema().safeParse({ name, email, password, confirmPassword });

    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof fieldErrors;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      await registerUser(name, email, password);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create account. Please try again.';
      setServerError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border/50 bg-card/75 backdrop-blur-xl shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Create an account</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          <div className="space-y-4 py-2">
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="font-semibold">Sign up successful</AlertTitle>
              <AlertDescription className="text-xs">
                Check your email for verification.
              </AlertDescription>
            </Alert>
            <div className="pt-2 text-center">
              <Button render={<Link href="/sign-in" />} className="w-full h-10 rounded-full font-medium">
                Back to Sign In
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive text-center">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 px-3 bg-background/50"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 px-3 bg-background/50"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-3 pr-10 bg-background/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Retype Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 pl-3 pr-10 bg-background/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <ModernButton type="submit" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign Up'}
              </ModernButton>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-full border-border/80 bg-background/50 hover:bg-muted font-medium"
            >
              <GoogleIcon />
              Sign up with Google
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center pt-0">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4 font-medium hover:text-primary">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
