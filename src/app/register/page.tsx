'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register as registerAction, clearError } from '@/store/slices/authSlice';
import { registerSchema, type RegisterFormValues } from '@/lib/validations';
import ThemeToggle from '@/components/shared/theme-toggle';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    dispatch(clearError());
    const result = await dispatch(
      registerAction({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    );

    if (registerAction.fulfilled.match(result)) {
      toast.success('Registrasi berhasil!');
      router.push('/customer/dashboard');
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border border-blue-100/80 shadow-xl shadow-blue-100/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <Image
              src="/bsp_logo.png"
              alt="BSP Insurance Broker"
              width={180}
              height={66}
              priority
              className="h-auto w-40"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">Daftar Akun</CardTitle>
          <CardDescription>
            Buat akun untuk mengajukan asuransi kebakaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Nama lengkap"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Daftar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Masuk
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
