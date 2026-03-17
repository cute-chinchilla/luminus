import { useState, useEffect } from 'preact/hooks';
import type { PromotionCategory } from '@/lib/types';

export default function CategoryManager() {
    const [categories, setCategories] = useState<(PromotionCategory & { promotions_count?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<PromotionCategory> | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (e) {
            console.error(e);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenNew = () => {
        setEditingItem({ name: '', is_active: 1 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: PromotionCategory) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const saveCategory = async (e: Event) => {
        e.preventDefault();
        if (!editingItem?.name) {
            alert('카테고리명은 필수입니다.');
            return;
        }

        const isEdit = !!editingItem.id;
        const url = isEdit ? `/api/admin/categories/${editingItem.id}` : '/api/admin/categories';
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
                fetchCategories();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까? 소속된 프로모션이 있으면 삭제가 거부될 수 있습니다.')) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const toggleActive = async (item: PromotionCategory) => {
        try {
            const res = await fetch(`/api/admin/categories/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 })
            });
            if (res.ok) fetchCategories();
        } catch (e) {
            console.error(e);
        }
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const newList = [...categories];
        const temp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = temp;
        updateOrder(newList);
    };

    const moveDown = async (index: number) => {
        if (index === categories.length - 1) return;
        const newList = [...categories];
        const temp = newList[index];
        newList[index] = newList[index + 1];
        newList[index + 1] = temp;
        updateOrder(newList);
    };

    const updateOrder = async (reordered: PromotionCategory[]) => {
        setCategories(reordered);
        const items = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }));
        try {
            await fetch('/api/admin/categories/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
        } catch (err) {
            console.error(err);
            fetchCategories();
        }
    };

    return (
        <>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">프로모션 카테고리</h2>
                    <p class="text-[13px] text-muted">예약 페이지의 필터 탭으로 활용될 카테고리입니다.</p>
                </div>
                <button
                    onClick={handleOpenNew}
                    class="bg-dark text-primary px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-black transition-colors"
                >
                    <i class="fas fa-plus mr-1.5"></i> 카테고리 추가
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
                ) : (
                    <table class="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr class="bg-gray-50/50">
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-16 text-center">순서</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500">카테고리명</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-32 text-center">소속 상품수</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24 text-center">활성</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-28 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((item, index) => (
                                <tr key={item.id} class="border-t border-gray-100/50 hover:bg-gray-50/50">
                                    <td class="py-3 px-4 text-center">
                                        <div class="flex flex-col items-center gap-1">
                                            <button disabled={index === 0} onClick={() => moveUp(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-up"></i></button>
                                            <button disabled={index === categories.length - 1} onClick={() => moveDown(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-down"></i></button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="text-[14px] font-bold text-dark">{item.name}</div>
                                    </td>
                                    <td class="py-3 px-4 text-center text-[13px] text-gray-600">
                                        <span class="inline-block bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{item.promotions_count || 0}개</span>
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
                                        <button onClick={() => deleteCategory(item.id)} class="text-gray-500 hover:text-red-500 p-1.5 cursor-pointer bg-transparent border-none" title="삭제"><i class="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr class="border-t border-gray-100">
                                    <td colSpan={5} class="py-10 text-center text-gray-500 text-sm">등록된 카테고리가 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && editingItem && (
                <div class="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 class="font-bold text-dark">{editingItem.id ? '카테고리 수정' : '새 카테고리 추가'}</h3>
                            <button type="button" onClick={closeModal} class="text-gray-400 hover:text-dark bg-transparent border-none text-xl cursor-pointer">&times;</button>
                        </div>

                        <div class="p-6">
                            <form id="categoryForm" onSubmit={saveCategory}>
                                <div class="mb-4">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">카테고리명 *</label>
                                    <input
                                        type="text"
                                        value={editingItem.name || ''}
                                        onChange={e => setEditingItem({ ...editingItem, name: (e.target as HTMLInputElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="예: 3월 프로모션"
                                        required
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

                        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                            <button type="button" onClick={closeModal} class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 border-none cursor-pointer transition-colors">취소</button>
                            <button form="categoryForm" type="submit" class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
