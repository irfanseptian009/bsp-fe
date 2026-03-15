'use client';

import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types';

interface StatusBadgeProps {
  status: RequestStatus;
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  [RequestStatus.APPROVED]: {
    label: 'Sudah Dibayar',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  [RequestStatus.REJECTED]: {
    label: 'Belum Dibayar',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  [RequestStatus.PENDING]: {
    label: 'Menunggu',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
