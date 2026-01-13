import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with proper thousand separators
export function formatCurrency(amount: number, currency: string = 'LAK'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₭';
  
  // Format with thousand separators using regex for consistent formatting
  const formatted = Math.abs(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = amount < 0 ? '-' : '';
  
  switch (currency) {
    case 'LAK':
      return sign + formatted + ' ₭';
    case 'THB':
      return sign + '฿' + formatted;
    case 'USD':
      return sign + '$' + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    default:
      return sign + formatted + ' ' + currency;
  }
}

// Format number with thousand separators only
export function formatNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return Math.abs(num).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format compact number (1K, 1M, etc.)
export function formatCompactNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const absNum = Math.abs(num);
  if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export function getStatusText(status: string, locale: string = 'en'): string {
  const statusTexts: Record<string, { en: string; lo: string }> = {
    pending: { en: 'Pending', lo: 'ລໍຖ້າ' },
    confirmed: { en: 'Confirmed', lo: 'ຢືນຢັນແລ້ວ' },
    in_progress: { en: 'In Progress', lo: 'ກຳລັງເຮັດ' },
    done: { en: 'Completed', lo: 'ສຳເລັດ' },
    cancelled: { en: 'Cancelled', lo: 'ຍົກເລີກ' },
    paid: { en: 'Paid', lo: 'ຊຳລະແລ້ວ' },
  };
  return statusTexts[status]?.[locale === 'lo' ? 'lo' : 'en'] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    done: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    paid: 'bg-emerald-100 text-emerald-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  return time.substring(0, 5);
}

export function formatDateTime(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'lo' ? 'lo-LA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Generate placeholder image URL for products
export function getProductImageUrl(name: string, category?: string): string {
  const seed = encodeURIComponent(name || 'product');
  const categoryColors: Record<string, string> = {
    'Hair Products': 'f472b6',
    'Skincare': 'a78bfa',
    'Nail Products': 'fb7185',
    'Massage Oils': '34d399',
    'Makeup': 'fbbf24',
    'Equipment': '60a5fa',
    'Consumables': '9ca3af',
  };
  const color = categoryColors[category || ''] || 'ec4899';
  return 'https://api.dicebear.com/7.x/shapes/svg?seed=' + seed + '&backgroundColor=' + color;
}

// Generate avatar URL
export function getAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name || 'user');
  return 'https://api.dicebear.com/7.x/initials/svg?seed=' + seed + '&backgroundColor=ec4899';
}
