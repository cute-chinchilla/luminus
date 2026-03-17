import { useState, useEffect } from 'preact/hooks';
import type { Notice } from '@/lib/types';
import ImageUploader from './ImageUploader';

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function NoticeManager() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Notice> | null>(null);

    const fetchNotices = async (page = 1, query = '', category = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/notices?page=${page}&limit=10&search=${encodeURIComponent(query)}&category=${category}`);
            const data = await res.json();
            if (data.success) {
                setNotices(data.data);
                setPagination(data.pagination);
            }
        } catch (e) {
            console.error(e);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices(currentPage, search, categoryFilter);
    }, [currentPage]);

    const handleSearch = (e: any) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchNotices(1, search, categoryFilter);
    };

    const handleCategoryChange = (cat: string) => {
        setCategoryFilter(cat);
        setCurrentPage(1);
        fetchNotices(1, search, cat);
    };

    const handleOpenNew = () => {
        setEditingItem({ title: '', content: '', thumbnail_url: '', category: 'notice', is_active: 1 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Notice) => {
        setEditingItem({ ...item });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const saveNotice = async (e: Event) => {
        e.preventDefault();
        if (!editingItem?.title) {
            alert('제목은 필수입니다.');
            return;
        }

        const isEdit = !!editingItem.id;
        const url = isEdit ? `/api/admin/notices/${editingItem.id}` : '/api/admin/notices';
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
                fetchNotices(currentPage, search, categoryFilter);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const deleteNotice = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchNotices(currentPage, search, categoryFilter);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const toggleActive = async (item: Notice) => {
        try {
            const res = await fetch(`/api/admin/notices/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 })
            });
            if (res.ok) fetchNotices(currentPage, search, categoryFilter);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">공지사항 및 이벤트 관리</h2>
                    <p class="text-[13px] text-muted">병원 소식과 진행 중인 이벤트를 관리합니다.</p>
                </div>
                <button
                    onClick={handleOpenNew}
                    class="bg-dark text-primary px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-black transition-colors"
                >
                    <i class="fas fa-plus mr-1.5"></i> 새 게시글 작성
                </button>
            </div>

            <div class="flex flex-col md:flex-row gap-4 mb-6">
                <div class="flex gap-2">
                    <button
                        onClick={() => handleCategoryChange('')}
                        class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${categoryFilter === '' ? 'bg-dark text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >전체</button>
                    <button
                        onClick={() => handleCategoryChange('notice')}
                        class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${categoryFilter === 'notice' ? 'bg-dark text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >공지사항</button>
                    <button
                        onClick={() => handleCategoryChange('event')}
                        class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${categoryFilter === 'event' ? 'bg-dark text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                    >이벤트</button>
                </div>

                <form onSubmit={handleSearch} class="flex flex-1 gap-2">
                    <div class="relative flex-1">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="제목 검색..."
                            value={search}
                            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                            class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button type="submit" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">검색</button>
                </form>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-gray-50/50">
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24">구분</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-32 text-center">썸네일</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500">제목</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-36 text-center">등록일</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-20 text-center">활성</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} class="py-20 text-center text-primary"><i class="fas fa-spinner fa-spin text-2xl"></i></td>
                                </tr>
                            ) : notices.map((item) => (
                                <tr key={item.id} class="border-t border-gray-100/50 hover:bg-gray-50/50">
                                    <td class="py-4 px-4">
                                        <span class={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${item.category === 'event' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {item.category === 'event' ? '이벤트' : '공지사항'}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <div class="w-20 h-12 rounded overflow-hidden bg-gray-100 mx-auto border border-gray-100">
                                            {item.thumbnail_url ? (
                                                <img src={item.thumbnail_url} class="w-full h-full object-cover" alt="thumb" />
                                            ) : (
                                                <div class="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1">No Image</div>
                                            )}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4 text-[14px] font-bold text-dark">{item.title}</td>
                                    <td class="py-4 px-4 text-center text-[13px] text-muted">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <button
                                            onClick={() => toggleActive(item)}
                                            class={`relative inline-flex h-5 w-9 min-w-[36px] items-center rounded-full transition-colors cursor-pointer border-none ${item.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                                        >
                                            <span class={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${item.is_active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                                        </button>
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <button onClick={() => handleOpenEdit(item)} class="text-gray-400 hover:text-blue-500 p-1.5 cursor-pointer bg-transparent border-none" title="수정"><i class="fas fa-edit"></i></button>
                                        <button onClick={() => deleteNotice(item.id)} class="text-gray-400 hover:text-red-500 p-1.5 cursor-pointer bg-transparent border-none" title="삭제"><i class="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            ))}
                            {notices.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} class="py-20 text-center text-gray-400 text-sm">등록된 게시글이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div class="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            class="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-30 cursor-pointer"
                        ><i class="fas fa-chevron-left text-xs"></i></button>
                        {[...Array(pagination.totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                class={`w-8 h-8 rounded text-sm font-bold border-none cursor-pointer ${currentPage === i + 1 ? 'bg-primary text-white' : 'bg-transparent text-gray-400 hover:bg-gray-100'}`}
                            >{i + 1}</button>
                        ))}
                        <button
                            disabled={currentPage === pagination.totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            class="w-8 h-8 rounded border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-30 cursor-pointer"
                        ><i class="fas fa-chevron-right text-xs"></i></button>
                    </div>
                )}
            </div>

            {isModalOpen && editingItem && (
                <div class="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 class="font-bold text-dark">{editingItem.id ? '게시글 수정' : '새 게시글 작성'}</h3>
                            <button type="button" onClick={closeModal} class="text-gray-400 hover:text-dark bg-transparent border-none text-xl cursor-pointer">&times;</button>
                        </div>

                        <div class="p-6 overflow-y-auto">
                            <form id="noticeForm" onSubmit={saveNotice}>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="space-y-4">
                                        <div>
                                            <label class="block text-[13px] font-bold text-dark mb-1.5">구분 *</label>
                                            <select
                                                value={editingItem.category || 'notice'}
                                                onChange={e => setEditingItem({ ...editingItem, category: (e.target as HTMLSelectElement).value as any })}
                                                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            >
                                                <option value="notice">공지사항</option>
                                                <option value="event">이벤트</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-[13px] font-bold text-dark mb-1.5">제목 *</label>
                                            <input
                                                type="text"
                                                value={editingItem.title || ''}
                                                onChange={e => setEditingItem({ ...editingItem, title: (e.target as HTMLInputElement).value })}
                                                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                placeholder="게시글 제목을 입력하세요"
                                                required
                                            />
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <label class="text-[13px] font-bold text-dark">노출 상태</label>
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, is_active: editingItem.is_active ? 0 : 1 })}
                                                class={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border-none ${editingItem.is_active ? 'bg-primary' : 'bg-gray-300'}`}
                                            >
                                                <span class={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${editingItem.is_active ? 'translate-x-5' : 'translate-x-1'}`}></span>
                                            </button>
                                            <span class="text-xs text-muted">{editingItem.is_active ? '공개' : '숨김'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">썸네일 이미지</label>
                                        <ImageUploader
                                            value={editingItem.thumbnail_url || ''}
                                            onChange={(url) => setEditingItem({ ...editingItem, thumbnail_url: url })}
                                            folder="notices"
                                        />
                                    </div>
                                </div>

                                <div class="mt-6">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">상세 내용 (HTML 지원)</label>
                                    <textarea
                                        rows={12}
                                        value={editingItem.content || ''}
                                        onChange={e => setEditingItem({ ...editingItem, content: (e.target as HTMLTextAreaElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-sans leading-relaxed"
                                        placeholder="게시글 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
                            <button type="button" onClick={closeModal} class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 bg-gray-100 border-none cursor-pointer transition-colors">취소</button>
                            <button form="noticeForm" type="submit" class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
