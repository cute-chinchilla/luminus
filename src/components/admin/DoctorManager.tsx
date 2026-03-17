import { useState, useEffect } from 'preact/hooks';
import type { Doctor } from '@/lib/types';
import ImageUploader from './ImageUploader';

export default function DoctorManager() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Doctor> | null>(null);
    const [credentialsList, setCredentialsList] = useState<string[]>([]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/doctors');
            const data = await res.json();
            if (data.success) {
                setDoctors(data.data);
            }
        } catch (e) {
            console.error(e);
            alert('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleOpenNew = () => {
        setEditingItem({ name: '', title: '원장', specialty: '', image_url: '', credentials: '[]', is_active: 1 });
        setCredentialsList(['']);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Doctor) => {
        setEditingItem({ ...item });
        try {
            const parsed = JSON.parse(item.credentials);
            setCredentialsList(Array.isArray(parsed) && parsed.length > 0 ? parsed : ['']);
        } catch {
            setCredentialsList(['']);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setCredentialsList([]);
    };

    const handleCredentialChange = (index: number, value: string) => {
        const newList = [...credentialsList];
        newList[index] = value;
        setCredentialsList(newList);
    };

    const addCredential = () => {
        setCredentialsList([...credentialsList, '']);
    };

    const removeCredential = (index: number) => {
        if (credentialsList.length <= 1) {
            setCredentialsList(['']);
            return;
        }
        setCredentialsList(credentialsList.filter((_, i) => i !== index));
    };

    const saveDoctor = async (e: Event) => {
        e.preventDefault();
        if (!editingItem?.name || !editingItem?.image_url) {
            alert('이름과 프로필 사진은 필수입니다.');
            return;
        }

        const filteredCredentials = credentialsList.filter(c => c.trim() !== '');
        const dataToSave = {
            ...editingItem,
            credentials: JSON.stringify(filteredCredentials)
        };

        const isEdit = !!editingItem.id;
        const url = isEdit ? `/api/admin/doctors/${editingItem.id}` : '/api/admin/doctors';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
            const data = await res.json();
            if (data.success) {
                closeModal();
                fetchDoctors();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const deleteDoctor = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/doctors/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setDoctors(prev => prev.filter(d => d.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const toggleActive = async (item: Doctor) => {
        try {
            const res = await fetch(`/api/admin/doctors/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...item, is_active: item.is_active ? 0 : 1 })
            });
            if (res.ok) fetchDoctors();
        } catch (e) {
            console.error(e);
        }
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const newList = [...doctors];
        const temp = newList[index];
        newList[index] = newList[index - 1];
        newList[index - 1] = temp;
        updateOrder(newList);
    };

    const moveDown = async (index: number) => {
        if (index === doctors.length - 1) return;
        const newList = [...doctors];
        const temp = newList[index];
        newList[index] = newList[index + 1];
        newList[index + 1] = temp;
        updateOrder(newList);
    };

    const updateOrder = async (reordered: Doctor[]) => {
        setDoctors(reordered);
        const items = reordered.map((item, idx) => ({ id: item.id, sort_order: idx }));
        try {
            await fetch('/api/admin/doctors/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });
        } catch (err) {
            console.error(err);
            fetchDoctors();
        }
    };

    return (
        <>
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="text-[18px] font-bold text-dark">의료진 관리</h2>
                    <p class="text-[13px] text-muted">의료진 소개 페이지의 원장님 프로필을 관리합니다.</p>
                </div>
                <button
                    onClick={handleOpenNew}
                    class="bg-dark text-primary px-4 py-2 rounded-lg text-sm font-bold border-none cursor-pointer hover:bg-black transition-colors"
                >
                    <i class="fas fa-plus mr-1.5"></i> 의료진 추가
                </button>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div class="p-10 text-center"><i class="fas fa-spinner fa-spin text-primary text-2xl"></i></div>
                ) : (
                    <table class="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-gray-50/50">
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-16 text-center">순서</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-20">사진</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-32">이름</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500">전문 분야 (Hover)</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-24 text-center">활성</th>
                                <th class="py-3 px-4 text-[13px] font-bold text-gray-500 w-28 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((item, index) => (
                                <tr key={item.id} class="border-t border-gray-100/50 hover:bg-gray-50/50">
                                    <td class="py-3 px-4 text-center">
                                        <div class="flex flex-col items-center gap-1">
                                            <button disabled={index === 0} onClick={() => moveUp(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-up"></i></button>
                                            <button disabled={index === doctors.length - 1} onClick={() => moveDown(index)} class="text-gray-400 hover:text-dark disabled:opacity-30 cursor-pointer bg-transparent border-none p-1"><i class="fas fa-caret-down"></i></button>
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="w-12 h-16 rounded overflow-hidden bg-gray-100">
                                            <img src={item.image_url} class="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                    </td>
                                    <td class="py-3 px-4">
                                        <div class="text-[14px] font-bold text-dark">{item.name}</div>
                                        <div class="text-[12px] text-gray-500">{item.title}</div>
                                    </td>
                                    <td class="py-3 px-4 text-[13px] text-gray-600 truncate max-w-[200px]">{item.specialty}</td>
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
                                        <button onClick={() => deleteDoctor(item.id)} class="text-gray-500 hover:text-red-500 p-1.5 cursor-pointer bg-transparent border-none" title="삭제"><i class="fas fa-trash-alt"></i></button>
                                    </td>
                                </tr>
                            ))}
                            {doctors.length === 0 && (
                                <tr class="border-t border-gray-100">
                                    <td colSpan={6} class="py-10 text-center text-gray-500 text-sm">등록된 의료진이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && editingItem && (
                <div class="fixed inset-0 bg-black/60 z-[3000] flex items-center justify-center p-4">
                    <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <h3 class="font-bold text-dark">{editingItem.id ? '의료진 수정' : '새 의료진 추가'}</h3>
                            <button type="button" onClick={closeModal} class="text-gray-400 hover:text-dark bg-transparent border-none text-xl cursor-pointer">&times;</button>
                        </div>

                        <div class="p-6 overflow-y-auto">
                            <form id="doctorForm" onSubmit={saveDoctor}>
                                <ImageUploader
                                    value={editingItem.image_url || ''}
                                    onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                                    folder="doctors"
                                    label="프로필 사진 *"
                                />

                                <div class="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">이름 *</label>
                                        <input
                                            type="text"
                                            value={editingItem.name || ''}
                                            onChange={e => setEditingItem({ ...editingItem, name: (e.target as HTMLInputElement).value })}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                            placeholder="김루미"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label class="block text-[13px] font-bold text-dark mb-1.5">직함 *</label>
                                        <select
                                            value={editingItem.title || '원장'}
                                            onChange={e => setEditingItem({ ...editingItem, title: (e.target as HTMLSelectElement).value })}
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                                            required
                                        >
                                            <option value="대표원장">대표원장</option>
                                            <option value="원장">원장</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <label class="block text-[13px] font-bold text-dark mb-1.5">전문 분야 (Hover 표시)</label>
                                    <textarea
                                        rows={2}
                                        value={editingItem.specialty || ''}
                                        onChange={e => setEditingItem({ ...editingItem, specialty: (e.target as HTMLTextAreaElement).value })}
                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                        placeholder="리프팅 전문, 스킨부스터..."
                                    ></textarea>
                                </div>

                                <div class="mb-4">
                                    <div class="flex justify-between items-center mb-1.5">
                                        <label class="block text-[13px] font-bold text-dark">약력 리스트</label>
                                        <button type="button" onClick={addCredential} class="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded cursor-pointer border-none hover:bg-gray-200"><i class="fas fa-plus mr-1"></i>추가</button>
                                    </div>

                                    <div class="space-y-2">
                                        {credentialsList.map((cred, idx) => (
                                            <div class="flex gap-2" key={idx}>
                                                <input
                                                    type="text"
                                                    value={cred}
                                                    onChange={e => handleCredentialChange(idx, (e.target as HTMLInputElement).value)}
                                                    class="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    placeholder="전) 00대학교 병원 전임의"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeCredential(idx)}
                                                    class="bg-red-50 text-red-500 px-3 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100"
                                                >
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
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
                            <button form="doctorForm" type="submit" class="px-4 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 border-none cursor-pointer transition-colors">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
