import { useState, useMemo, useEffect } from 'preact/hooks';

interface Category {
    id: string;
    name: string;
    sort_order: number;
}

interface Promotion {
    id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    original_price: number;
    discount_percent: number;
    badge_text?: string;
    badge_color?: string;
    extra_note?: string;
    sort_order: number;
}

interface SelectedItem {
    id: string;
    name: string;
    price: number;
}

interface PromotionClientProps {
    categories: Category[];
    promotions: Promotion[];
}
export default function PromotionClient({ categories, promotions }: PromotionClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'popular' | 'low' | 'high'>('popular');

    // Default to 'All' category on mount
    useEffect(() => {
        if (categories.length > 0 && !selectedCategory) {
            const allCat = categories.find(c => {
                const n = c.name.toString().toLowerCase();
                return n.includes('all') || n.includes('전체');
            });
            const defaultId = allCat ? allCat.id.toString() : categories[0].id.toString();
            console.log('Setting default category:', defaultId, allCat?.name);
            setSelectedCategory(defaultId);
        }
    }, [categories, selectedCategory]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // --- Booking Form State ---
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingContent, setBookingContent] = useState('');
    const [bookingName, setBookingName] = useState('');
    const [bookingPhone, setBookingPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lock body scroll when overlay is open
    useEffect(() => {
        if (isSheetOpen || isBookingOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSheetOpen, isBookingOpen]);

    // Derived state: Filtered & Sorted Promotions
    const visiblePromotions = useMemo(() => {
        const selectedCatObj = categories.find(c => Number(c.id) === Number(selectedCategory));
        const name = selectedCatObj?.name?.trim().toLowerCase() || '';
        const isAll = name.includes('all') || name.includes('전체') || Number(selectedCategory) === 2;

        console.log('Filtering promotions:', { selectedCategory, name, isAll, totalPromos: promotions.length });

        let list = isAll
            ? [...promotions]
            : promotions.filter(p => Number(p.category_id) === Number(selectedCategory));

        if (sortOrder === 'low') {
            list.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'high') {
            list.sort((a, b) => b.price - a.price);
        } else {
            list.sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
        }
        return list;
    }, [promotions, categories, selectedCategory, sortOrder]);

    const totalPrice = useMemo(() => {
        return selectedItems.reduce((acc, curr) => acc + curr.price, 0);
    }, [selectedItems]);

    const handleCheckboxChange = (promo: Promotion, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, { id: promo.id, name: promo.name, price: promo.price }]);
        } else {
            setSelectedItems(prev => prev.filter(item => item.id !== promo.id));
        }
    };

    const isSelected = (id: string) => selectedItems.some(item => item.id === id);

    const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const handleOpenBooking = () => {
        if (selectedItems.length === 0) {
            alert('시술을 선택해주세요.');
            return;
        }
        setIsSheetOpen(false);
        setIsBookingOpen(true);
    };

    const handleSubmitBooking = async () => {
        if (!bookingName || !bookingPhone || !bookingDate || !bookingTime) {
            alert('필수 항목을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/public/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: bookingName,
                    customer_phone: bookingPhone,
                    booking_date: bookingDate,
                    booking_time: bookingTime,
                    booking_content: bookingContent,
                    items: selectedItems,
                    total_price: totalPrice
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('예약 상담 신청이 완료되었습니다.\n확인 후 연락드리겠습니다.');

                // 상태 초기화
                setIsBookingOpen(false);
                setSelectedItems([]);
                setBookingName('');
                setBookingPhone('');
                setBookingDate('');
                setBookingTime('');
                setBookingContent('');
            } else {
                alert(result.error || '예약 신청 중 오류가 발생했습니다.');
            }
        } catch (error) {
            alert('서버와의 통신 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
        .promo-checkbox { appearance: none; -webkit-appearance: none; width: 22px; height: 22px; border: 2px solid #d1d5db; border-radius: 4px; cursor: pointer; position: relative; flex-shrink: 0; transition: all .2s ease; }
        .promo-checkbox:checked { background: #1a1a1a; border-color: #D4A017; }
        .promo-checkbox:checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 14px; font-weight: bold; }
        .reservation-btn-fixed { position: fixed; bottom: 73px; left: 0; width: 100%; z-index: 998; }
        @media (min-width: 768px) { .reservation-btn-fixed { bottom: 0; } } /* 모바일이 아닐 경우 탭바 높이 제거 */
      `}} />

            {/* CATEGORY TABS */}
            <section class="bg-white border-b border-gray-100 sticky top-[88px] md:top-[97px] z-[500]">
                <div class="max-w-[1200px] mx-auto overflow-x-auto scrollbar-hide" style="-webkit-overflow-scrolling:touch">
                    <div class="flex gap-2 py-3 px-5 md:px-10 w-max min-w-full md:justify-center">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                class={`px-4 py-2 rounded-full text-[13px] font-medium border whitespace-nowrap cursor-pointer transition-colors ${selectedCategory === cat.id
                                    ? 'bg-primary text-dark border-primary'
                                    : 'bg-transparent text-muted-foreground border-gray-200 hover:border-dark'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* NOTICE BANNER */}
            <section class="bg-dark text-center py-4 px-5">
                <p class="text-[13px] text-white/70">
                    <i class="fas fa-info-circle text-primary mr-1.5"></i>
                    모든 가격은 <span class="text-primary font-bold">VAT 포함가</span>이며, 결제는 내원 시 진행됩니다.
                </p>
            </section>

            {/* PRODUCT LIST */}
            <section class="py-10 md:py-16 px-5 md:px-10 bg-surface min-h-screen pb-40">
                <div class="max-w-[1200px] mx-auto">
                    {/* Sort & Count */}
                    <div class="flex items-center justify-between mb-6 fade-up">
                        <p class="text-sm text-muted"><span class="text-dark font-bold">{visiblePromotions.length}</span>개의 프로모션</p>
                        <div class="flex items-center gap-3 text-[13px]">
                            <button
                                onClick={() => setSortOrder('popular')}
                                class={`cursor-pointer bg-transparent border-none ${sortOrder === 'popular' ? 'text-dark font-medium' : 'text-muted hover:text-dark'}`}
                            >인기순</button>
                            <span class="text-gray-300">|</span>
                            <button
                                onClick={() => setSortOrder('low')}
                                class={`cursor-pointer bg-transparent border-none ${sortOrder === 'low' ? 'text-dark font-medium' : 'text-muted hover:text-dark'}`}
                            >낮은가격순</button>
                            <span class="text-gray-300">|</span>
                            <button
                                onClick={() => setSortOrder('high')}
                                class={`cursor-pointer bg-transparent border-none ${sortOrder === 'high' ? 'text-dark font-medium' : 'text-muted hover:text-dark'}`}
                            >높은가격순</button>
                        </div>
                    </div>

                    {/* List */}
                    <div class="flex flex-col gap-3">
                        {visiblePromotions.map(promo => (
                            <div key={promo.id} class="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow" style={{ minHeight: '120px', display: 'block', visibility: 'visible', opacity: 1, backgroundColor: '#ffffff' }}>
                                <div class="flex items-center p-4 md:p-5 gap-4">
                                    <div class="flex-1 min-w-0">
                                        {promo.badge_text && (
                                            <span class={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mb-2 ${promo.badge_color || 'bg-primary text-dark'}`}>
                                                {promo.badge_text}
                                            </span>
                                        )}
                                        <h4 class="text-[14px] md:text-[15px] font-bold text-dark mb-1 leading-snug">{promo.name}</h4>
                                        <p class="text-[12px] md:text-[13px] text-muted mb-2.5">{promo.description}</p>

                                        {promo.extra_note && (
                                            <p class="text-[10px] text-primary mb-2 whitespace-pre-wrap">{promo.extra_note}</p>
                                        )}

                                        <div class="flex items-baseline gap-2">
                                            <span class="text-[18px] md:text-[20px] font-black text-primary">
                                                {formatPrice(promo.price)}<span class="text-xs font-bold">원</span>
                                            </span>
                                            {promo.original_price > promo.price && (
                                                <>
                                                    <span class="text-[12px] text-muted line-through">{formatPrice(promo.original_price)}원</span>
                                                    <span class="text-[11px] text-red-500 font-bold ml-1">{promo.discount_percent}% OFF</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        class="promo-checkbox"
                                        checked={isSelected(promo.id)}
                                        onChange={(e) => handleCheckboxChange(promo, (e.target as HTMLInputElement).checked)}
                                    />
                                </div>
                            </div>
                        ))}

                        {visiblePromotions.length === 0 && (
                            <div class="text-center py-20 text-muted">해당 카테고리의 프로모션이 없습니다.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* 예약상담하기 고정 버튼 */}
            <div class="reservation-btn-fixed">
                <button
                    onClick={() => setIsSheetOpen(true)}
                    class="w-full py-4 bg-dark text-primary text-[15px] font-bold border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-black transition-colors tracking-wider"
                >
                    <i class="fas fa-calendar-plus"></i> 예약상담하기 {selectedItems.length > 0 && <span class="bg-primary text-dark text-xs px-2 py-0.5 rounded-full ml-1">{selectedItems.length}</span>}
                </button>
            </div>

            {/* 바텀시트: 선택한 프로모션 목록 */}
            <div
                class={`fixed inset-0 bg-black/50 z-[2000] transition-opacity duration-300 ${isSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSheetOpen(false)}
            >
                <div
                    class={`absolute bottom-0 left-0 w-full max-h-[85vh] bg-white rounded-t-2xl z-[2001] transition-transform duration-300 flex flex-col ${isSheetOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                        <span class="font-bold text-dark">선택한 시술 내역</span>
                        <button onClick={() => setIsSheetOpen(false)} class="text-[15px] text-muted bg-transparent border-none cursor-pointer font-medium p-1">닫기</button>
                    </div>
                    <div class="flex-1 overflow-y-auto px-5 py-6 min-h-[150px]">
                        {selectedItems.length === 0 ? (
                            <p class="text-muted text-[14px]">찜한시술 없음</p>
                        ) : (
                            selectedItems.map((item, idx) => (
                                <div key={item.id} class={`flex items-center justify-between py-3 ${idx < selectedItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <span class="text-[14px] text-dark font-medium pr-4">{item.name}</span>
                                    <div class="flex items-center gap-3">
                                        <span class="text-[14px] font-bold text-dark">{formatPrice(item.price)}원</span>
                                        <button onClick={() => handleCheckboxChange({ id: item.id } as Promotion, false)} class="text-gray-400 hover:text-red-500">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div class="border-t border-gray-200 flex-shrink-0"></div>
                    <div class="px-5 py-6 flex-shrink-0 pb-10">
                        <div class="flex items-center justify-between mb-1">
                            <div>
                                <span class="text-[18px] font-black mr-1">합계</span><span class="text-[13px] text-muted">(VAT 포함)</span>
                            </div>
                            <span class="text-[22px] font-black text-primary">{formatPrice(totalPrice)}<span class="text-[15px] ml-1">원</span></span>
                        </div>
                        <p class="text-[12px] text-muted mb-6">* 결제는 내원 시 진행됩니다.</p>
                        <button
                            onClick={handleOpenBooking}
                            class="w-full py-4 bg-dark text-primary text-[15px] font-bold rounded-lg border-none cursor-pointer hover:bg-black transition-colors tracking-wider"
                        >
                            찜한 목록 예약하기
                        </button>
                    </div>
                </div>
            </div>

            {/* 예약 폼 패널 */}
            <div
                class={`fixed inset-0 bg-black/50 z-[3000] transition-opacity duration-300 ${isBookingOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsBookingOpen(false)}
            >
                <div
                    class={`absolute bottom-0 left-0 w-full h-[90vh] bg-white rounded-t-2xl z-[3001] transition-transform duration-300 flex flex-col ${isBookingOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                        <button
                            onClick={() => { setIsBookingOpen(false); setIsSheetOpen(true); }}
                            class="text-[15px] text-muted bg-transparent border-none cursor-pointer font-medium p-1 flex items-center gap-1"
                        >
                            <i class="fas fa-chevron-left text-xs"></i> 이전
                        </button>
                        <span class="font-bold text-dark">예약 정보 입력</span>
                        <button onClick={() => setIsBookingOpen(false)} class="text-[15px] text-muted bg-transparent border-none cursor-pointer font-medium p-1">닫기</button>
                    </div>

                    <div class="flex-1 overflow-y-auto px-5 py-6 pb-20">
                        <h3 class="text-[18px] font-bold text-dark mb-1">*필수 기입항목</h3>
                        <p class="text-[13px] text-muted mb-6">원활한 예약을 위해 아래 정보를 정확히 입력해 주세요.</p>

                        <div class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <label class="block text-[13px] font-bold text-dark mb-2">선택한 시술 목록</label>
                            <div class="text-[14px] text-muted leading-relaxed">
                                {selectedItems.map(i => i.name).join(', ')}
                            </div>
                        </div>

                        <div class="mb-6">
                            <label class="block text-[14px] font-bold text-dark mb-2">희망예약일자 <span class="text-primary">*</span></label>
                            <input
                                type="date"
                                value={bookingDate}
                                onChange={(e) => setBookingDate((e.target as HTMLInputElement).value)}
                                class="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] text-dark bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                        </div>

                        <div class="mb-6">
                            <label class="block text-[14px] font-bold text-dark mb-2">희망예약시간 <span class="text-primary">*</span></label>
                            <select
                                value={bookingTime}
                                onChange={(e) => setBookingTime((e.target as HTMLSelectElement).value)}
                                class="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] text-dark bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                style={{ WebkitAppearance: 'none' }}
                            >
                                <option value="" disabled>시간을 선택해주세요</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="13:00">13:00</option>
                                <option value="14:00">14:00</option>
                                <option value="15:00">15:00</option>
                                <option value="16:00">16:00</option>
                                <option value="17:00">17:00</option>
                                <option value="18:00">18:00</option>
                                <option value="19:00">19:00</option>
                            </select>
                        </div>

                        <div class="mb-6">
                            <label class="block text-[14px] font-bold text-dark mb-2">예약 내용 및 요청사항</label>
                            <textarea
                                rows={3}
                                value={bookingContent}
                                onChange={(e) => setBookingContent((e.target as HTMLTextAreaElement).value)}
                                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                                placeholder="추가 요청사항이나 궁금하신 점을 작성해 주세요"
                            ></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="block text-[14px] font-bold text-dark mb-2">이름 <span class="text-primary">*</span></label>
                            <input
                                type="text"
                                value={bookingName}
                                onChange={(e) => setBookingName((e.target as HTMLInputElement).value)}
                                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="홍길동"
                            />
                        </div>

                        <div class="mb-8">
                            <label class="block text-[14px] font-bold text-dark mb-2">연락처 <span class="text-primary">*</span></label>
                            <input
                                type="tel"
                                value={bookingPhone}
                                onChange={(e) => setBookingPhone((e.target as HTMLInputElement).value)}
                                class="w-full border border-gray-200 rounded-lg px-4 py-3 text-[14px] bg-white text-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <button
                            onClick={handleSubmitBooking}
                            disabled={isSubmitting}
                            class={`w-full py-4 text-primary text-[15px] font-bold rounded-lg border-none cursor-pointer transition-colors tracking-wider flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-dark hover:bg-black'}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <i class="fas fa-spinner fa-spin"></i> 처리 중...
                                </>
                            ) : '예약 상담 신청 완료'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
