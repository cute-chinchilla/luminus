import { useState } from 'preact/hooks';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();

        if (!name || !phone || !message) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, message }),
            });

            const result = await response.json();
            if (result.success) {
                setIsSuccess(true);
                setName('');
                setPhone('');
                setMessage('');
            } else {
                alert(result.error || '발송 중 오류가 발생했습니다.');
            }
        } catch (error) {
            alert('서버와의 통신 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div class="bg-surface p-10 rounded-2xl text-center fade-up lg:max-w-[1200px] mx-auto">
                <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-check text-primary text-2xl"></i>
                </div>
                <h4 class="text-xl font-bold text-dark mb-4">문의가 접수되었습니다.</h4>
                <p class="text-muted text-[15px] mb-8">내용 확인 후 남겨주신 연락처로 안내해 드리겠습니다.</p>
                <button
                    onClick={() => setIsSuccess(false)}
                    class="inline-block py-3 px-8 border border-dark text-dark text-sm font-bold tracking-widest no-underline hover:bg-dark hover:text-white transition-all rounded-lg"
                >
                    추가 문의하기
                </button>
            </div>
        );
    }

    return (
        <div class="bg-surface p-8 md:p-12 rounded-2xl fade-up lg:max-w-[1200px] mx-auto">
            <div class="mb-10 text-center">
                <h4 class="text-xl md:text-2xl font-bold text-dark mb-2">궁금하신 점이 있으신가요?</h4>
                <p class="text-sm text-muted">상담 내용을 남겨주시면 친절히 답변해 드리겠습니다.</p>
            </div>

            <form onSubmit={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-1">
                    <label class="block text-sm font-bold text-dark mb-2">성함</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName((e.target as HTMLInputElement).value)}
                        class="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="홍길동"
                        required
                    />
                </div>
                <div class="md:col-span-1">
                    <label class="block text-sm font-bold text-dark mb-2">연락처</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone((e.target as HTMLInputElement).value)}
                        class="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        placeholder="010-1234-5678"
                        required
                    />
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-bold text-dark mb-2">상담 내용</label>
                    <textarea
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
                        class="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                        placeholder="시술에 대한 궁금증이나 희망하시는 내원 시간을 자유롭게 적어주세요."
                        required
                    ></textarea>
                </div>
                <div class="md:col-span-2 text-center mt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        class={`inline-flex items-center justify-center gap-2 py-4 px-12 md:w-auto w-full bg-dark text-primary text-sm font-bold tracking-widest rounded-lg transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-black hover:shadow-lg'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <i class="fas fa-spinner fa-spin"></i> 발송 중...
                            </>
                        ) : '문의하기'}
                    </button>
                    <p class="text-[11px] text-muted mt-4">
                        * 개인정보 수집 및 이용에 동의할 경우에만 문의가 가능합니다.
                    </p>
                </div>
            </form>
        </div>
    );
}
