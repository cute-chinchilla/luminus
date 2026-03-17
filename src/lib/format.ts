import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(dateString: string): string {
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return format(d, 'yyyy.MM.dd HH:mm', { locale: ko });
    } catch {
        return dateString;
    }
}

export function formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
        return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return phone;
}

export function formatPrice(price: number): string {
    if (price === undefined || price === null) return '0원';
    return `${Number(price).toLocaleString()}원`;
}

export function statusToKorean(status: string): string {
    if (status === '전체') return '전체';
    const map: Record<string, string> = {
        pending: '대기중',
        confirmed: '예약확정',
        cancelled: '예약취소',
        completed: '시술완료'
    };
    return map[status] || status;
}

export function statusToBadgeColor(status: string): string {
    const map: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
        completed: 'bg-green-100 text-green-700'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
}
