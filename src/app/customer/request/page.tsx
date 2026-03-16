'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createInsuranceRequest } from '@/store/slices/requestSlice';
import { fetchOccupationTypes } from '@/store/slices/occupationSlice';
import { insuranceRequestSchema, type InsuranceRequestFormValues } from '@/lib/validations';
import { formatRupiah } from '@/lib/formatCurrency';
import { Role, ConstructionClass } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

/* ─── Construction class descriptions ─── */
const CONSTRUCTION_CLASSES = [
  {
    value: ConstructionClass.KELAS_1,
    label: 'Kelas I',
    description:
      'Dinding, Lantai, Dan Semua Komponen Penunjang Strukturalnya Serta Penutup Atap Terbuat Seluruhnya Dan Sepenuhnya Dari Bahan-Bahan Yang Tidak Mudah Terbakar',
  },
  {
    value: ConstructionClass.KELAS_2,
    label: 'Kelas II',
    description:
      'Penutup Atap Terbuat Dari Sirap Kayu Keras, Dinding-Dinding Mengandung Bahan-Bahan Yang Dapat Terbakar Sampai Maksimum 20% Dari Luas Dinding, Lantai Dan Struktur-Struktur Penunjangnya Terbuat Dari Kayu',
  },
  {
    value: ConstructionClass.KELAS_3,
    label: 'Kelas III',
    description: 'Selain Konstruksi Kelas I Dan Kelas II',
  },
];

export default function InsuranceRequestPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { occupationTypes, isLoading: occupationLoading, error: occupationError } =
    useAppSelector((state) => state.occupations);
  const { isLoading } = useAppSelector((state) => state.requests);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<InsuranceRequestFormValues>({
    resolver: zodResolver(insuranceRequestSchema),
    defaultValues: {
      occupationTypeId: '',
      earthquake: false,
      duration: 1,
      district: '-',
    },
  });

  useEffect(() => {
    dispatch(fetchOccupationTypes());
  }, [dispatch]);

  const selectedOccupationId = useWatch({ control, name: 'occupationTypeId' });
  const buildingPrice = useWatch({ control, name: 'buildingPrice' });
  const duration = useWatch({ control, name: 'duration' });
  const selectedConstructionClass = useWatch({ control, name: 'constructionClass' });

  /* ─── Live premium preview ─── */
  const selectedOccupation = occupationTypes.find(
    (o) => o.id === selectedOccupationId,
  );
  const selectedDurationLabel = duration ? `${duration} Tahun` : '';
  const premiumPreview =
    selectedOccupation && buildingPrice && duration
      ? (buildingPrice * selectedOccupation.premiumRate) / 1000 * duration
      : 0;
  const totalPreview = premiumPreview + 10000;

  const onSubmit = async (values: InsuranceRequestFormValues) => {
    const occupationExists = occupationTypes.some(
      (type) => type.id === values.occupationTypeId,
    );

    if (!occupationExists) {
      toast.error('Tipe okupasi tidak valid. Silakan pilih ulang.');
      return;
    }

    const result = await dispatch(createInsuranceRequest(values));

    if (createInsuranceRequest.fulfilled.match(result)) {
      toast.success('Request asuransi berhasil dikirim!');
      // Navigate to invoice page with the invoice number
      const invoiceNumber = result.payload.invoiceNumber;
      router.push(`/customer/invoice?inv=${encodeURIComponent(invoiceNumber)}`);
    } else {
      toast.error(result.payload as string);
    }
  };

  return (
    <RouteGuard requiredRole={Role.CUSTOMER}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="dark:from-primary/10 dark:via-background dark:to-background rounded-2xl border border-orange-100/60 bg-linear-to-br p-6 shadow-sm dark:border-orange-500/20">
          <p className="mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            Ajukan Asuransi
          </p>
          <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            Asuransi Kebakaran
          </h1>
          <p className="text-muted-foreground mt-1">
            Isi form berikut untuk mengajukan asuransi kebakaran
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-border/70 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-slate-900/70">
            <CardContent className="p-6">
              {/* Two column layout matching the screenshot */}
              <div className="grid gap-8 lg:grid-cols-2">
                {/* ─── LEFT COLUMN ─── */}
                <div className="space-y-5">
                  <div className="mb-1">
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Informasi Polis</p>
                    <p className="text-muted-foreground text-xs">Lengkapi data pertanggungan dan karakter properti.</p>
                  </div>

                  {/* Jangka Waktu Pertanggungan */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">
                      Jangka Waktu Pertanggungan
                    </Label>
                    <Select
                      value={duration ? String(duration) : ''}
                      onValueChange={(val) => {
                        setValue('duration', parseInt(String(val), 10), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        void trigger('duration');
                      }}
                    >
                      <SelectTrigger id="duration">
                        <span className="line-clamp-1 text-left">
                          {selectedDurationLabel || 'Pilih Jangka Waktu Pertanggungan'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y} Tahun
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.duration && (
                      <p className="text-xs text-red-500">{errors.duration.message}</p>
                    )}
                  </div>

                  {/* Okupasi */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Okupasi</Label>
                    <Select
                      value={selectedOccupationId ?? ''}
                      onValueChange={(val) => {
                        setValue('occupationTypeId', String(val), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                        void trigger('occupationTypeId');
                      }}
                    >
                      <SelectTrigger id="occupationTypeId">
                        <span className="line-clamp-1 text-left">
                          {selectedOccupation?.name || 'Pilih Okupasi'}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {occupationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {occupationLoading && (
                      <p className="text-xs text-gray-500">Memuat tipe okupasi...</p>
                    )}
                    {!occupationLoading && occupationTypes.length === 0 && (
                      <p className="text-xs text-amber-600">
                        Data tipe okupasi belum tersedia. Silakan coba lagi.
                      </p>
                    )}
                    {occupationError && (
                      <p className="text-xs text-red-500">{occupationError}</p>
                    )}
                    {errors.occupationTypeId && (
                      <p className="text-xs text-red-500">
                        {errors.occupationTypeId.message}
                      </p>
                    )}
                  </div>

                  {/* Harga Bangunan */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Harga Bangunan</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        Rp
                      </span>
                      <Input
                        id="buildingPrice"
                        type="number"
                        className="pl-10"
                        placeholder="0"
                        {...register('buildingPrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.buildingPrice && (
                      <p className="text-xs text-red-500">
                        {errors.buildingPrice.message}
                      </p>
                    )}
                  </div>

                  {/* Konstruksi — Radio Buttons */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700">Konstruksi</Label>
                    {CONSTRUCTION_CLASSES.map((cls) => (
                      <label
                        key={cls.value}
                        className="flex cursor-pointer items-start gap-3"
                      >
                        <input
                          type="radio"
                          name="constructionClass"
                          value={cls.value}
                          checked={selectedConstructionClass === cls.value}
                          onChange={() =>
                            setValue('constructionClass', cls.value, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                        />
                        <div>
                          <p className="text-sm font-semibold text-blue-600">
                            {cls.label}
                          </p>
                          <p className="text-xs leading-relaxed text-gray-500 italic">
                            {cls.description}
                          </p>
                        </div>
                      </label>
                    ))}
                    {errors.constructionClass && (
                      <p className="text-xs text-red-500">
                        {errors.constructionClass.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* ─── RIGHT COLUMN ─── */}
                <div className="space-y-5">
                  <div className="mb-1">
                    <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">Lokasi Pertanggungan</p>
                    <p className="text-muted-foreground text-xs">Masukkan alamat objek agar verifikasi risiko lebih akurat.</p>
                  </div>

                  {/* Alamat Objek Pertanggungan */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">
                      Alamat Objek Pertanggungan
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Alamat lengkap properti"
                      rows={4}
                      {...register('address')}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Provinsi */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Provinsi</Label>
                    <Input
                      id="province"
                      placeholder="Provinsi"
                      {...register('province')}
                    />
                    {errors.province && (
                      <p className="text-xs text-red-500">{errors.province.message}</p>
                    )}
                  </div>

                  {/* Kota/Kabupaten & Daerah */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-700">Kota/Kabupaten</Label>
                      <Input
                        id="city"
                        placeholder="Kota/Kabupaten"
                        {...register('city')}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">{errors.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-gray-700">Daerah</Label>
                      <Input
                        id="area"
                        placeholder="Daerah"
                        {...register('area')}
                      />
                      {errors.area && (
                        <p className="text-xs text-red-500">{errors.area.message}</p>
                      )}
                    </div>
                  </div>

                  {/* District (Kabupaten) - hidden in layout, stored as same city for now */}
                  <input type="hidden" {...register('district')} />

                  {/* Perluasan — Gempa Bumi */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Perluasan</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="earthquake"
                        onCheckedChange={(checked) => {
                          setValue('earthquake', !!checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      <Label htmlFor="earthquake" className="cursor-pointer text-sm">
                        Gempa Bumi
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium Preview */}
              {premiumPreview > 0 && (
                <div className="from-blue-50 to-orange-50 mt-6 rounded-xl border border-blue-100/80 bg-linear-to-r p-5 shadow-sm dark:border-blue-500/20 dark:from-blue-500/10 dark:to-orange-500/10">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-slate-100">
                    Estimasi Biaya
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Premi Dasar</span>
                      <span className="font-medium">
                        {formatRupiah(premiumPreview)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biaya Administrasi</span>
                      <span className="font-medium">Rp 10.000</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-blue-700">
                        {formatRupiah(totalPreview)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading || occupationLoading || occupationTypes.length === 0}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Check Premi
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </RouteGuard>
  );
}
