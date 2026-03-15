import { z } from 'zod';
import { ConstructionClass } from '@/types';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export const insuranceRequestSchema = z.object({
  occupationTypeId: z.string().min(1, 'Tipe okupasi wajib dipilih'),
  buildingPrice: z
    .number({ message: 'Harga bangunan wajib diisi' })
    .positive('Harga bangunan harus lebih dari 0'),
  duration: z
    .number({ message: 'Jangka waktu wajib dipilih' })
    .min(1, 'Minimal 1 tahun')
    .max(10, 'Maksimal 10 tahun'),
  constructionClass: z.nativeEnum(ConstructionClass, {
    message: 'Kelas konstruksi wajib dipilih',
  }),
  address: z.string().trim().min(1, 'Alamat wajib diisi'),
  province: z.string().trim().min(1, 'Provinsi wajib diisi'),
  city: z.string().trim().min(1, 'Kota wajib diisi'),
  district: z.string().trim().min(1),
  area: z.string().trim().min(1, 'Daerah wajib diisi'),
  earthquake: z.boolean().optional(),
});

export const occupationTypeSchema = z.object({
  code: z.string().trim().min(1, 'Kode wajib diisi'),
  name: z.string().trim().min(1, 'Nama wajib diisi'),
  premiumRate: z
    .number({ message: 'Rate premi wajib diisi' })
    .positive('Rate premi harus lebih dari 0'),
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
});

export const policySchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  branchId: z.string().min(1, 'Cabang wajib dipilih'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  duration: z.number().min(1, 'Minimal 1 tahun').max(10, 'Maksimal 10 tahun'),
  buildingPrice: z.number().positive('Harga bangunan harus lebih dari 0'),
  occupationTypeId: z.string().min(1, 'Tipe okupasi wajib dipilih'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type InsuranceRequestFormValues = z.infer<typeof insuranceRequestSchema>;
export type OccupationTypeFormValues = z.infer<typeof occupationTypeSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type PolicyFormValues = z.infer<typeof policySchema>;
