import { useState, useEffect } from 'preact/hooks';
import type { Promotion, PromotionCategory } from '@/lib/types';

export default function PromotionManager() {
    const [promotions, setPromotions] = useState<(Promotion & { category_name?: string })[]>([]);
    const [categories, setCategories] = useState<PromotionCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Promotion> | null>(null);

    // Filter state
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [promoRes, catRes] = await Promise.all([
                fetch(`/api/admin/promotions${selectedCategoryId ? `?category_id=${selectedCategoryId}` : ''}`),
                fetch('/api/admin/categories')
            ]);
            const promoData = await promoRes.json();
            const catData = await catRes.json();

            if (promoData.success) setPromotions(promoData.data);
            if (catData.success) setCategories(catData.data);
        } catch (e) {
            console.error(e);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedCategoryId]);

    const handleOpenNew = () => {
        setEditingItem({
            category_id: categories[0]?.id || 0,
            name: '',
            description: '',
            price: 0,
            original_price: 0,
            discount_percent: 0,
            badge_text: '',
            extra_note: '',
            is_active: 1
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Promotion) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    // Auto calculate discount
    const handlePriceChange = (price: number, original: number) => {
        let newEditingItem = { ...editingItem, price, original_price: original };
        if (price > 0 && original > 0 && original >= price) {
            newEditingItem.discount_percent = Math.round((1 - price / original) * 100);
        } else {
            newEditingItem.discount_percent = editingItem?.discount_percent || 0;
        }
        setEditingItem(newEditingItem as Partial<Promotion>);
    };

    const savePromotion = async (e: Event) => {
        e.preventDefault();
        if (!editingItem?.name || !editingItem?.price || !editingItem?.category_id) {
            alert('필수 값을 모두 입력해주세요.');
            return;
        }

        const isEdit = !!editingItem.id;
        const url = isEdit ? `/api/admin/promotions/${editingItem.id}` : '/api/admin/promotions';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem)
            });
            const data = await res.json();
            if (data.success) {
                closeModal();
                fetchData();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const deletePromotion = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setPromotions(prev => prev.filter(p => p.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const toggleActive = async (item: Promotion) => {
        try {
            const res = await fetch(`/api/admin/promotions/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 })
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const newList = [...promotions];
        const temp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = temp;
        updateOrder(newList);
    };

    const moveDown = async (index: number) => {
        if (index === promotions.length - 1) return;
        const newList = [...promotions];
        const temp = newList[index];
        newList[index] = newList[index + 1];
        newList[index + 1] = temp;
        updateOrder(newList);
    };

    const updateOrder = async (reordered: Promotion[]) => {
        setPromotions(reordered);
        const items = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }));
        try {
            await fetch('/api/admin/promotions/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
        } catch (err) {
            console.error(err);
            fetchData();
        }
    };

    return (
        <>
            <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">초특가 프로모션 상품 관리</h2>
                    <p class="text-[13px] text-muted">카테고리별로 개별 시술 상품을 기획하고 노출합니다.</p>
                </div>
                <div class="flex items-center gap-2">
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId((e.target as HTMLSelectElement).value)}
                        class="border border-gray-200 text-sm rounded-lg px-3 py-2 bg-white outline-none focus:border-primary"
                    >
                        <option value="">전체 카테고리 시청</option>
                        {categories.map(cat => (
                            <option value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleOpenNew}
                        class="bg-dark text-primary px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-black transition-colors whitespace-nowrap"
                    >
                        <i class="fas fa-plus mr-1.5"></i> 상품 등록
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
                ) : (
                    <>
                        <table class="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr class="bg-gray-50/50">
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-16 text-center">순서</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24">뱃지</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 min-w-[200px]">상품 정보</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24">카테고리</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 max-w-[150px]">판매가</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24 text-center">활성</th>
                                    <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-28 text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promotions.map((item, index) => (
                                    <tr key={item.id} class="border-t border-gray-100/50 hover:bg-gray-50/50">
                                        <td class="py-3 px-4 text-center">
                                            <div class="flex flex-col items-center gap-1">
                                                <button disabled={index === 0 || !selectedCategoryId} onClick={() => moveUp(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-up"></i></button>
                                                <button disabled={index === promotions.length - 1 || !selectedCategoryId} onClick={() => moveDown(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-down"></i></button>
                                            </div>
                                        </td>
                                        <td class="py-3 px-4">
                                            {item.badge_text ? (
                                                <span class="inline-block px-2 text-[10px] font-bold py-1 bg-gray-100 text-dark border border-gray-200 whitespace-nowrap">{item.badge_text}</span>
                                            ) : (
                                                <span class="text-gray-300 text-[11px]">-</span>
                                            )}
                                        </td>
                                        <td class="py-3 px-4">
                                            <div class="text-[14px] font-bold text-dark mb-0.5">{item.name}</div>
                                            <div class="text-[12px] text-gray-500 truncate max-w-[250px]" title={item.description}>{item.description || '-'}</div>
                                            {item.extra_note && <div class="text-[11px] text-primary mt-0.5 truncate max-w-[250px]">{item.extra_note}</div>}
                                        </td>
                                        <td class="py-3 px-4 text-[13px] text-gray-600">
                                            {item.category_name}
                                        </td>
                                        <td class="py-3 px-4">
                                            <div class="text-[14px] font-bold text-red-600">{Number(item.price).toLocaleString()}원</div>
                                            {item.original_price > 0 && (
                                                <div class="flex gap-1.5 items-center mt-0.5">
                                                    <span class="text-[11px] text-gray-400 line-through">{Number(item.original_price).toLocaleString()}원</span>
                                                    {item.discount_percent > 0 && <span class="text-[11px] text-white bg-red-500 px-1 rounded font-bold">-{item.discount_percent}%</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button
                                                onClick={() => toggleActive(item)}
                                                class={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border-none ${item.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                                            >
                                                <span class={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                                            </button>
                                        </td>
                                        <td class="py-3 px-4 text-center">
                                            <button onClick={() => handleOpenEdit(item)} class="text-gray-500 hover:text-blue-500 p-1.5 cursor-pointer bg-transparent border-none" title="수정"><i class="fas fa-edit"></i></button>
                                            <button onClick={() => deletePromotion(item.id)} class="text-gray-500 hover:text-red-500 p-1.5 cursor-pointer bg-transparent border-none" title="삭제"><i class="fas fa-trash-alt"></i></button>
                                        </td>
                                    </tr>
                                ))}
                                {promotions.length === 0 && (
                                    <tr class="border-t border-gray-100">
                                        <td colSpan={7} class="py-10 text-center text-gray-500 text-sm">
                                            {selectedCategoryId ? '이 카테고리에 등록된 상품이 없습니다.' : '등록된 프로모션 상품이 없습니다.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {!selectedCategoryId && promotions.length > 0 && (
                            <div class="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
                                <span class="text-[12px] text-gray-500"><i class="fas fa-info-circle mr-1"></i> 순서 정렬은 카테고리 필터가 선택된 상태에서만 가능합니다.</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && editingItem && (
                <div class="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <h3 class="font-bold text-dark">{editingItem.id ? '프로모션 상품 수정' : '새 프로모션 등록'}</h3>
                            <button type="button" onClick={closeModal} class="text-gray-400 hover:text-dark bg-transparent border-none text-xl cursor-pointer">&times;</button>
                        </div>

                        <div class="p-6 overflow-y-auto">
                            <form id="promoForm" onSubmit={savePromotion}>

                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">카테고리 *</label>
                                        <select
                                            value={editingItem.category_id || ''}
                                            onChange={e => setEditingItem({ ...editingItem, category_id: parseInt((e.target as HTMLSelectElement).value) })}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                                            required
                                        >
                                            <option value="" disabled>분류를 선택하세요</option>
                                            {categories.map(cat => (
                                                <option value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">뱃지명 (선택)</label>
                                        <input
                                            type="text"
                                            value={editingItem.badge_text || ''}
                                            onChange={e => setEditingItem({ ...editingItem, badge_text: (e.target as HTMLInputElement).value })}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="예: BEST / 선착순 10명"
                                        />
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">프로모션 명칭 *</label>
                                    <input
                                        type="text"
                                        value={editingItem.name || ''}
                                        onChange={e => setEditingItem({ ...editingItem, name: (e.target as HTMLInputElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="예: [소프웨이브 런칭] 50펄스"
                                        required
                                    />
                                </div>

                                <div class="mb-4">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">시술 상세 부위 / 설명</label>
                                    <input
                                        type="text"
                                        value={editingItem.description || ''}
                                        onChange={e => setEditingItem({ ...editingItem, description: (e.target as HTMLInputElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="예: 눈가 / 입가 집중 타겟"
                                    />
                                </div>

                                <div class="grid grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">정상가(원, 숫자만)</label>
                                        <input
                                            type="number"
                                            value={editingItem.original_price || ''}
                                            onChange={e => handlePriceChange(editingItem.price || 0, parseInt((e.target as HTMLInputElement).value) || 0)}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-bold text-red-600 mb-1.5">할인 판매가 *</label>
                                        <input
                                            type="number"
                                            value={editingItem.price || ''}
                                            onChange={e => handlePriceChange(parseInt((e.target as HTMLInputElement).value) || 0, editingItem.original_price || 0)}
                                            class="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none font-bold text-red-600"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">할인율 (%)</label>
                                        <input
                                            type="number"
                                            value={editingItem.discount_percent || 0}
                                            onChange={e => setEditingItem({ ...editingItem, discount_percent: parseInt((e.target as HTMLInputElement).value) || 0 })}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">마킹 추가 안내 문구 (선택)</label>
                                    <input
                                        type="text"
                                        value={editingItem.extra_note || ''}
                                        onChange={e => setEditingItem({ ...editingItem, extra_note: (e.target as HTMLInputElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="※ 본 패키지는 VAT 별도입니다."
                                    />
                                </div>

                                <div class="flex items-center gap-3 mt-6">
                                    <label class="text-[13px] font-bold text-dark">노출 상태</label>
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem({ ...editingItem, is_active: editingItem.is_active ? 0 : 1 })}
                                        class={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border-none ${editingItem.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                                    >
                                        <span class={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editingItem.is_active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                                    </button>
                                    <span class="text-xs text-muted">{editingItem.is_active ? '사용 중' : '숨김'}</span>
                                </div>
                            </form>
                        </div>

                        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50 flex-shrink-0">
                            <button type="button" onClick={closeModal} class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 border-none cursor-pointer transition-colors">취소</button>
                            <button form="promoForm" type="submit" class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
