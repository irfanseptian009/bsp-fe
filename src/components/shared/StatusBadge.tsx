'use client';

import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types';

interface StatusBadgeProps {
  status: RequestStatus;
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  [RequestStatus.APPROVED]: {
    label: 'Sudah Dibayar',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300',
  },
  [RequestStatus.REJECTED]: {
    label: 'Belum Dibayar',
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-300',
  },
  [RequestStatus.PENDING]: {
    label: 'Menunggu',
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-300',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge className={config.className}>{config.label}</Badge>;
}
