'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile, uploadProfilePhoto } from '@/store/slices/authSlice';
import { profileSchema, type ProfileFormValues } from '@/lib/validations';
import { Role } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const selectedPreviewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  const avatarUrl = selectedPreviewUrl ?? user?.profilePhotoUrl;
  const initials = (user?.name?.[0] || 'U').toUpperCase();

  const onSubmit = async (values: ProfileFormValues) => {
    if (selectedFile) {
      const photoResult = await dispatch(uploadProfilePhoto(selectedFile));
      if (uploadProfilePhoto.fulfilled.match(photoResult)) {
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(photoResult.payload as string);
        return;
      }
    }

    const result = await dispatch(updateProfile(values));

    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profil admin berhasil diperbarui!');
    } else {
      toast.error(result.payload as string);
    }
  };

  const onChangePhoto = async () => {
    if (!selectedFile) {
      toast.error('Pilih file foto terlebih dahulu');
      return;
    }

    const result = await dispatch(uploadProfilePhoto(selectedFile));
    if (uploadProfilePhoto.fulfilled.match(result)) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Foto profil admin berhasil diperbarui!');
      return;
    }

    toast.error(result.payload as string);
  };

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Profil Admin</h1>
          <p className="text-gray-500">Perbarui foto dan informasi akun admin</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-200 bg-white">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Foto Profil"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-blue-700">
                    {initials}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  if (!file) {
                    setSelectedFile(null);
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    toast.error('Ukuran foto maksimal 5MB');
                    event.target.value = '';
                    setSelectedFile(null);
                    return;
                  }

                  setSelectedFile(file);
                }}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Camera className="h-4 w-4" />
                  Pilih Foto
                </Button>
                <Button
                  type="button"
                  className="bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-500 dark:hover:bg-orange-600"
                  onClick={onChangePhoto}
                  disabled={isLoading || !selectedFile}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Upload Foto
                </Button>
              </div>

              <p className="text-xs text-slate-500">Format: JPG, PNG, WEBP (maks. 5MB)</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
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
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
