/**
 * Currency formatting utilities for Indonesian Rupiah.
 */

/** Format as "IDR 100,000,000.00" */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format as "Rp 100.000.000" (no decimals, Indonesian locale) */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
