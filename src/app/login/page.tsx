'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Flame, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { Role } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
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
      toast.error(result.payload as string);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-0 shadow-orange-100/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-200">
            <Flame className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Masuk ke FIMS</CardTitle>
          <CardDescription>
            Fire Insurance Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Masuk
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-medium text-orange-600 hover:text-orange-700"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
