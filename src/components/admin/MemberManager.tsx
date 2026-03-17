import { useState, useEffect } from 'preact/hooks';
import type { User } from '@/lib/types';

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function MemberManager() {
    const [members, setMembers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMembers = async (page = 1, query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/members?page=${page}&limit=20&search=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
                setPagination(data.pagination);
            }
        } catch (e) {
            console.error(e);
            alert('회원 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers(currentPage, search);
    }, [currentPage]);

    const handleSearch = (e: any) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMembers(1, search);
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`${user.clerk_id} 사용자의 권한을 ${newRole === 'admin' ? '관리자' : '일반 회원'}로 변경하시겠습니까?`)) return;

        try {
            const res = await fetch(`/api/admin/members/${user.id}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            const data = await res.json();
            if (data.success) {
                setMembers(members.map(m => m.id === user.id ? { ...m, role: newRole } : m));
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert('권한 변경 중 오류가 발생했습니다.');
        }
    };

    const toggleActive = async (user: User) => {
        const newStatus = user.is_active ? 0 : 1;
        try {
            const res = await fetch(`/api/admin/members/${user.id}/active`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setMembers(members.map(m => m.id === user.id ? { ...m, is_active: newStatus } : m));
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert('상태 변경 중 오류가 발생했습니다.');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">회원 관리</h2>
                    <p class="text-[13px] text-muted">사이트 이용자 및 관리자 권한을 관리합니다.</p>
                </div>

                <form onSubmit={handleSearch} class="flex w-full md:w-auto gap-2">
                    <div class="relative flex-1 md:w-64">
                        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Clerk ID 검색..."
                            value={search}
                            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
                            class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button type="submit" class="px-4 py-2 bg-dark text-white rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-black transition-colors whitespace-nowrap">검색</button>
                    {(search || currentPage !== 1) && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); setCurrentPage(1); fetchMembers(1, ''); }}
                            class="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border-none cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            초기화
                        </button>
                    )}
                </form>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr class="bg-gray-50/50">
                                <th class="py-3.5 px-5 text-[13px] font-bold text-gray-500 border-b border-gray-100">회원 정보 (Clerk ID)</th>
                                <th class="py-3.5 px-5 text-[13px] font-bold text-gray-500 border-b border-gray-100 w-32 text-center">권한</th>
                                <th class="py-3.5 px-5 text-[13px] font-bold text-gray-500 border-b border-gray-100 w-48 text-center">가입일시</th>
                                <th class="py-3.5 px-5 text-[13px] font-bold text-gray-500 border-b border-gray-100 w-32 text-center">상태</th>
                                <th class="py-3.5 px-5 text-[13px] font-bold text-gray-500 border-b border-gray-100 w-40 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} class="py-20 text-center">
                                        <i class="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
                                        <p class="text-sm text-muted">데이터를 불러오는 중입니다...</p>
                                    </td>
                                </tr>
                            ) : members.length > 0 ? (
                                members.map(user => (
                                    <tr key={user.id} class="hover:bg-gray-50/30 transition-colors group">
                                        <td class="py-4 px-5 border-b border-gray-100/50">
                                            <div class="flex items-center gap-3">
                                                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <i class="fas fa-user text-lg"></i>
                                                </div>
                                                <div>
                                                    <p class="text-[14px] font-bold text-dark mb-0.5">{(user as any).name || 'Unknown'}</p>
                                                    <p class="text-[12px] text-muted">{(user as any).email || user.clerk_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="py-4 px-5 border-b border-gray-100/50 text-center">
                                            <span class={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                {user.role === 'admin' ? '관리자' : '일반회원'}
                                            </span>
                                        </td>
                                        <td class="py-4 px-5 border-b border-gray-100/50 text-center text-[13px] text-muted">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td class="py-4 px-5 border-b border-gray-100/50 text-center">
                                            <span class={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${user.is_active ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                                                }`}>
                                                <span class={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.is_active ? '활성' : '정지'}
                                            </span>
                                        </td>
                                        <td class="py-4 px-5 border-b border-gray-100/50 text-center">
                                            <div class="flex justify-center gap-2">
                                                <button
                                                    onClick={() => toggleRole(user)}
                                                    class="px-2.5 py-1.5 bg-white border border-gray-200 rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    {user.role === 'admin' ? '권한 해제' : '관리자 지정'}
                                                </button>
                                                <button
                                                    onClick={() => toggleActive(user)}
                                                    class={`px-2.5 py-1.5 border rounded text-[12px] font-medium transition-colors cursor-pointer ${user.is_active
                                                        ? 'bg-white border-red-200 text-red-500 hover:bg-red-50'
                                                        : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {user.is_active ? '정지' : '활성화'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} class="py-20 text-center text-sm text-muted">검색된 회원이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                    <div class="px-5 py-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
                        <p class="text-[13px] text-muted">총 <span class="font-bold text-dark">{pagination.total}</span>명의 회원</p>
                        <div class="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <i class="fas fa-chevron-left text-xs"></i>
                            </button>

                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <button
                                    onClick={() => setCurrentPage(i + 1)}
                                    class={`w-8 h-8 flex items-center justify-center rounded text-[13px] font-medium transition-colors cursor-pointer ${currentPage === i + 1
                                        ? 'bg-dark text-white border-dark'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage === pagination.totalPages}
                                class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <i class="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
