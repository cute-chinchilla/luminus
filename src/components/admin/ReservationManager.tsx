import { useState, useEffect } from 'preact/hooks';
import type { Reservation } from '@/lib/types';
import { formatDate, formatPhone, formatPrice, statusToKorean, statusToBadgeColor } from '@/lib/format';

export default function ReservationManager() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('전체');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });

    // Detail Panel
    const [selectedItem, setSelectedItem] = useState<Reservation | null>(null);
    const [memo, setMemo] = useState('');
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            });
            if (statusFilter !== '전체') params.append('status', statusFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/reservations?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setReservations(data.data);
                setPagination(data.pagination);

                // Update selected item if currently open
                if (selectedItem) {
                    const updated = data.data.find((r: Reservation) => r.id === selectedItem.id);
                    if (updated) setSelectedItem(updated);
                }
            }
        } catch (e) {
            console.error(e);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [page, statusFilter, dateFrom, dateTo]); // Refetch on filter change except search string

    const handleSearch = (e: Event) => {
        e.preventDefault();
        setPage(1); // Reset page on new search
        fetchReservations();
    };

    const openDetail = (item: Reservation) => {
        setSelectedItem(item);
        setMemo(item.memo || '');
        setIsPanelOpen(true);
    };

    const closeDetail = () => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedItem(null), 300); // Wait for transition
    };

    const updateStatus = async (newStatus: string) => {
        if (!selectedItem) return;
        try {
            const res = await fetch(`/api/admin/reservations/${selectedItem.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchReservations();
        } catch (e) {
            alert('상태 변경 오류');
        }
    };

    const saveMemo = async () => {
        if (!selectedItem) return;
        try {
            const res = await fetch(`/api/admin/reservations/${selectedItem.id}/memo`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memo })
            });
            if (res.ok) {
                alert('메모가 저장되었습니다.');
                fetchReservations();
            }
        } catch (e) {
            alert('메모 저장 오류');
        }
    };

    return (
        <>
            <div class="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">예약 상담 관리</h2>
                    <p class="text-[13px] text-muted">예약 접수 목록을 확인하고 상태를 변경합니다.</p>
                </div>
            </div>

            {/* Filters */}
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div class="flex flex-wrap gap-2 flex-shrink-0">
                    {['전체', 'pending', 'confirmed', 'cancelled', 'completed'].map(status => (
                        <button
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            class={`px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${statusFilter === status ? 'bg-dark text-primary border-dark' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            {statusToKorean(status)}
                        </button>
                    ))}
                </div>
                <div class="h-px md:h-8 md:w-px bg-gray-200"></div>
                <div class="flex flex-col md:flex-row gap-4 flex-1">
                    <div class="flex items-center gap-2">
                        <input type="date" value={dateFrom} onChange={e => setDateFrom((e.target as HTMLInputElement).value)} class="border border-gray-200 text-sm rounded px-2 py-1.5 outline-none focus:border-primary w-[130px]" />
                        <span class="text-gray-400">~</span>
                        <input type="date" value={dateTo} onChange={e => setDateTo((e.target as HTMLInputElement).value)} class="border border-gray-200 text-sm rounded px-2 py-1.5 outline-none focus:border-primary w-[130px]" />
                    </div>
                    <form onSubmit={handleSearch} class="flex flex-1 relative min-w-[200px]">
                        <input
                            type="text"
                            placeholder="예약자명 또는 연락처"
                            value={search}
                            onChange={e => setSearch((e.target as HTMLInputElement).value)}
                            class="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-1.5 text-sm outline-none focus:border-primary"
                        />
                        <button type="submit" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark">
                            <i class="fas fa-search"></i>
                        </button>
                    </form>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                {loading && reservations.length === 0 ? (
                    <div class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
                    </div>
                ) : (
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr class="bg-gray-50/50">
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-16 text-center">No.</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-28">신청일시</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24">상태</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24">예약자명</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-32">연락처</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 min-w-[200px]">희망일/시술 내역</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => openDetail(item)}
                                        class={`border-t border-gray-100/50 cursor-pointer transition-colors ${selectedItem?.id === item.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td class="py-3 px-4 text-center text-[12px] text-gray-400">{item.id}</td>
                                        <td class="py-3 px-4 text-[12px] text-gray-500">{formatDate(item.created_at)}</td>
                                        <td class="py-3 px-4">
                                            <span class={`inline-block px-2.5 py-1 text-[11px] font-bold rounded ${statusToBadgeColor(item.status)}`}>
                                                {statusToKorean(item.status)}
                                            </span>
                                        </td>
                                        <td class="py-3 px-4 text-[14px] font-bold text-dark">{item.customer_name}</td>
                                        <td class="py-3 px-4 text-[13px] text-gray-600 font-mono tracking-tight">{formatPhone(item.customer_phone)}</td>
                                        <td class="py-3 px-4">
                                            <div class="flex items-center gap-2 mb-0.5">
                                                <span class="text-[12px] font-bold text-blue-600 bg-blue-50 px-1 rounded">{item.booking_date} {item.booking_time}</span>
                                            </div>
                                            <div class="text-[12px] text-gray-500 truncate max-w-[250px]">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(item.items_json);
                                                        return items.map((i: any) => i.name).join(', ') || '요청사항만 있음';
                                                    } catch {
                                                        return '파싱 오류';
                                                    }
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {reservations.length === 0 && (
                                    <tr class="border-t border-gray-100">
                                        <td colSpan={6} class="py-16 text-center text-gray-500 text-sm">
                                            조건에 맞는 예약 건이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <span class="text-[12px] text-gray-500">총 <b>{pagination.total}</b>건</span>
                        <div class="flex gap-1">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} class="px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs hover:bg-gray-50"><i class="fas fa-chevron-left"></i></button>
                            <span class="px-3 py-1 text-sm font-bold text-dark">{page} / {pagination.totalPages}</span>
                            <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} class="px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs hover:bg-gray-50"><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-in Detail Panel Overlay */}
            <div class={`fixed inset-0 bg-black/20 z-[2000] transition-opacity duration-300 ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeDetail}></div>

            {/* Slide-in Detail Panel */}
            <div class={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-[2001] shadow-2xl transform transition-transform duration-300 flex flex-col ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedItem && (
                    <>
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <span class="text-xs text-gray-500">예약 번호 #{selectedItem.id}</span>
                                <h3 class="font-bold text-dark text-lg">{selectedItem.customer_name}님의 예약</h3>
                            </div>
                            <button type="button" onClick={closeDetail} class="text-gray-400 hover:text-dark text-2xl bg-transparent border-none cursor-pointer">&times;</button>
                        </div>

                        <div class="flex-1 overflow-y-auto p-6 bg-white">
                            <div class="mb-6 pb-6 border-b border-gray-100">
                                <h4 class="text-[13px] font-bold text-dark mb-4">상태 관리</h4>
                                <div class="grid grid-cols-4 gap-2">
                                    {['pending', 'confirmed', 'cancelled', 'completed'].map(status => (
                                        <button
                                            onClick={() => updateStatus(status)}
                                            class={`py-2 text-[13px] font-bold rounded-lg border text-center transition-colors ${selectedItem.status === status ? statusToBadgeColor(status) + ' ring-2 ring-primary border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {statusToKorean(status)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div class="mb-6 pb-6 border-b border-gray-100">
                                <h4 class="text-[13px] font-bold text-dark mb-4">예약 상세 정보</h4>
                                <div class="space-y-3 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">연락처</span>
                                        <span class="font-bold text-dark">{formatPhone(selectedItem.customer_phone)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">희망 일자</span>
                                        <span class="text-dark bg-gray-100 px-2 rounded">{selectedItem.booking_date}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">희망 시간</span>
                                        <span class="text-dark bg-gray-100 px-2 rounded">{selectedItem.booking_time}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-500">접수 일시</span>
                                        <span class="text-gray-600">{formatDate(selectedItem.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-6 pb-6 border-b border-gray-100">
                                <h4 class="text-[13px] font-bold text-dark mb-4">선택 시술 내용</h4>
                                <div class="bg-gray-50 rounded-lg p-3">
                                    <ul class="space-y-2 mb-3">
                                        {(() => {
                                            try {
                                                const items = JSON.parse(selectedItem.items_json);
                                                if (items.length === 0) return <li class="text-sm text-gray-500 text-center py-2">상품 선택 없음</li>;
                                                return items.map((i: any) => (
                                                    <li class="flex justify-between text-[13px]">
                                                        <span class="text-dark">• {i.name}</span>
                                                        <span class="text-gray-500 text-right min-w-[80px]">{formatPrice(i.price)}</span>
                                                    </li>
                                                ));
                                            } catch {
                                                return <li class="text-sm text-red-500">파싱 오류</li>;
                                            }
                                        })()}
                                    </ul>
                                    <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <span class="text-[13px] font-bold text-dark">총 예상 금액</span>
                                        <span class="text-[15px] font-bold text-red-600">{formatPrice(selectedItem.total_price)}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-6 pb-6 border-b border-gray-100">
                                <h4 class="text-[13px] font-bold text-dark mb-2">고객 요청.문의사항</h4>
                                <div class="text-[13px] text-gray-700 bg-amber-50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                                    {selectedItem.booking_content || <span class="text-gray-400 italic">남긴 내용이 없습니다.</span>}
                                </div>
                            </div>

                            <div>
                                <h4 class="text-[13px] font-bold text-dark mb-2">관리자 내부 메모</h4>
                                <textarea
                                    rows={4}
                                    value={memo}
                                    onChange={e => setMemo((e.target as HTMLTextAreaElement).value)}
                                    placeholder="고객 응대 시 특이사항이나 메모를 입력하세요. (고객에게는 보이지 않습니다)"
                                    class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                ></textarea>
                                <div class="flex justify-end mt-2">
                                    <button onClick={saveMemo} class="px-4 py-2 bg-dark text-white text-xs font-bold rounded hover:bg-black transition-colors">메모 저장</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
