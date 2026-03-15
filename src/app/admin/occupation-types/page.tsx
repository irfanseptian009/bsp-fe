'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import RouteGuard from '@/components/layout/RouteGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOccupationTypes,
  createOccupationType,
  updateOccupationType,
  deleteOccupationType,
} from '@/store/slices/occupationSlice';
import { occupationTypeSchema, type OccupationTypeFormValues } from '@/lib/validations';
import { Role, OccupationType } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function OccupationTypesPage() {
  const dispatch = useAppDispatch();
  const { occupationTypes, isLoading } = useAppSelector((state) => state.occupations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OccupationType | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const getErrorMessage = (payload: unknown, fallback: string) => {
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload;
    }
    return fallback;
  };


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OccupationTypeFormValues>({
    resolver: zodResolver(occupationTypeSchema),
  });

  useEffect(() => {
    dispatch(fetchOccupationTypes());
  }, [dispatch]);

  const openCreate = () => {
    setEditingItem(null);
    reset({ code: '', name: '', premiumRate: 0 });
    setIsDialogOpen(true);
  };

  const openEdit = (item: OccupationType) => {
    setEditingItem(item);
    reset({
      code: item.code,
      name: item.name,
      premiumRate: item.premiumRate,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: OccupationTypeFormValues) => {
    if (editingItem) {
      const result = await dispatch(
        updateOccupationType({ id: editingItem.id, payload: values }),
      );
      if (updateOccupationType.fulfilled.match(result)) {
        toast.success('Tipe okupasi berhasil diperbarui!');
        setIsDialogOpen(false);
      } else {
        toast.error(
          getErrorMessage(result.payload, 'Gagal memperbarui tipe okupasi. Silakan coba lagi.'),
        );
      }
    } else {
      const result = await dispatch(createOccupationType(values));
      if (createOccupationType.fulfilled.match(result)) {
        toast.success('Tipe okupasi berhasil ditambahkan!');
        setIsDialogOpen(false);
      } else {
        toast.error(
          getErrorMessage(result.payload, 'Gagal menambahkan tipe okupasi. Silakan coba lagi.'),
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    const result = await dispatch(deleteOccupationType(deleteTargetId));
    if (deleteOccupationType.fulfilled.match(result)) {
      toast.success('Tipe okupasi berhasil dihapus!');
      setDeleteTargetId(null);
    } else {
      toast.error(
        getErrorMessage(result.payload, 'Gagal menghapus tipe okupasi. Silakan coba lagi.'),
      );
    }
  };

  return (
    <RouteGuard requiredRole={Role.ADMIN}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tipe Okupasi</h1>
            <p className="text-gray-500">
              Kelola tipe okupasi dan rate premi
            </p>
          </div>
          <Button
            className="gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            Tambah Okupasi
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Tipe Okupasi' : 'Tambah Tipe Okupasi'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kode</Label>
                  <Input placeholder="Contoh: 2976.01" {...register('code')} />
                  {errors.code && (
                    <p className="text-xs text-red-500">{errors.code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input placeholder="Contoh: Pabrik" {...register('name')} />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Rate Premi</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="Contoh: 1.7500"
                    {...register('premiumRate', { valueAsNumber: true })}
                  />
                  {errors.premiumRate && (
                    <p className="text-xs text-red-500">
                      {errors.premiumRate.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Hapus Tipe Okupasi</DialogTitle>
                <DialogDescription>
                  Yakin ingin menghapus tipe okupasi ini? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
                  Batal
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Hapus
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Rate Premi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {occupationTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-mono">{type.code}</TableCell>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      <TableCell>{type.premiumRate}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => openEdit(type)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTargetId(type.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}
