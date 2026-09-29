const kes = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const day = new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
const dayShort = new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short' });
const monthYear = new Intl.DateTimeFormat('en-KE', { month: 'short', year: 'numeric' });

/** True when an API date or timestamp falls in the current calendar month, local time. */
export const inThisMonth = (value: string | null | undefined): boolean => {
    if (!value) return false;
    const date = toDate(value);
    const now = new Date();
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

export const money = (value: number | string | null | undefined): string =>
    kes.format(Number(value ?? 0));

/**
 * Parses "2026-09-19" as a local date (not UTC midnight), and the API's
 * "2026-09-19 08:30:00" timestamps as UTC, which is how Laravel stores them.
 */
const toDate = (value: string): Date => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`);
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return new Date(`${value.replace(' ', 'T')}Z`);
    return new Date(value);
};

export const shortDate = (value: string | null | undefined): string =>
    value ? day.format(toDate(value)) : '—';

export const dayMonth = (value: string | null | undefined): string =>
    value ? dayShort.format(toDate(value)) : '—';

export const period = (value: string | null | undefined): string =>
    value ? monthYear.format(toDate(value)) : '—';

const clock = new Intl.DateTimeFormat('en-KE', { hour: '2-digit', minute: '2-digit' });

/** "14:05" for a timestamp; empty for a plain date. */
export const timeOf = (value: string | null | undefined): string =>
    value && value.length > 10 ? clock.format(toDate(value)) : '';

/** Timestamp as a Date, so grids sort and filter on real dates. */
export const asDate = (value: string | null | undefined): Date | null => (value ? toDate(value) : null);

export const personName = (first?: string | null, last?: string | null): string =>
    [first, last].filter(Boolean).join(' ') || '—';

export const initials = (name: string): string =>
    name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';

export const percent = (ratio: number | null | undefined): string =>
    ratio === null || ratio === undefined ? '—' : `${Math.round(ratio * 100)}%`;

/** "partially_paid" -> "Partially paid" */
export const label = (value: string | null | undefined): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ') : '—';

export const daysSince = (value: string): number =>
    Math.max(0, Math.floor((Date.now() - toDate(value).getTime()) / 86_400_000));

/** "just now", "12m ago", "3h ago", "2d ago", then a plain date. */
export const timeAgo = (value: string | null | undefined): string => {
    if (!value) return '—';
    const minutes = Math.floor((Date.now() - toDate(value).getTime()) / 60_000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d ago`;
    return dayMonth(value);
};

/** INV-000164 */
export const invoiceNo = (id: number): string => `INV-${String(id).padStart(6, '0')}`;

export const METHOD_LABELS: Record<string, string> = {
    mpesa: 'M-Pesa',
    bank: 'Bank',
    cash: 'Cash',
    card: 'Card',
};
