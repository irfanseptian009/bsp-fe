'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { Role } from '@/types';
import ThemeToggle from '@/components/shared/theme-toggle';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mapLoginError = (message?: string) => {
    const normalized = (message || '').toLowerCase();

    if (
      normalized.includes('invalid credentials') ||
      normalized.includes('unauthorized') ||
      normalized.includes('invalid password') ||
      normalized.includes('wrong password') ||
      normalized.includes('password salah') ||
      normalized.includes('login gagal')
    ) {
      return 'Password salah. Silakan periksa kembali dan coba lagi.';
    }

    if (
      normalized.includes('email') ||
      normalized.includes('user not found') ||
      normalized.includes('akun tidak ditemukan')
    ) {
      return 'Email tidak terdaftar. Silakan cek kembali email Anda.';
    }

    if (normalized.includes('network') || normalized.includes('timeout')) {
      return 'Koneksi bermasalah. Periksa internet Anda lalu coba lagi.';
    }

    return message || 'Login gagal. Silakan coba lagi.';
  };

  const emailField = register('email', {
    onChange: () => {
      dispatch(clearError());
      clearErrors('email');
    },
  });

  const passwordField = register('password', {
    onChange: () => {
      dispatch(clearError());
      clearErrors('password');
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    dispatch(clearError());
    const result = await dispatch(login(values));

    if (login.fulfilled.match(result)) {
      toast.success('Login berhasil!');
      const user = result.payload.user;
      if (user.role === Role.ADMIN) {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } else {
      const payloadMessage =
        typeof result.payload === 'string' ? result.payload : undefined;
      const fallbackMessage = result.error?.message;
      const message = mapLoginError(payloadMessage || fallbackMessage || error || undefined);
      setError('password', { type: 'server', message });
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-400/20" />
      <div className="absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl dark:bg-orange-400/20" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="relative rounded-4xl w-full max-w-md p-10 border border-blue-100/80 bg-white/95  shadow-2xl dark:shadow-blue-600/70 shadow-black/30 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/95 ">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 rounded-4xl  border border-blue-100 bg-white px-5 py-4 shadow-md dark:border-slate-700 dark:bg-slate-800">
            <Image
              src="/bsp_logo.png"
              alt="BSP Insurance Broker"
              width={180}
              height={66}
              priority
              className="h-auto w-40"
            />
          </div>
          <CardDescription>
            Insurance Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Login gagal</p>
                  <p>{mapLoginError(error)}</p>
                </div>
              </div>
            ) : null}

            <div className="space-y-6">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  autoComplete="email"
                  className="pl-9 py-5"
                  {...emailField}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  autoComplete="current-password"
                  className="pl-9 pr-10 py-5"
                  {...passwordField}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Masuk
            </Button>

        
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
