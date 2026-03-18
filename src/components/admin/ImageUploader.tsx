import { useState, useRef } from 'preact/hooks';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
}

export default function ImageUploader({ value, onChange, folder = 'common', label = '이미지 업로드' }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        await processAndUpload(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processAndUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp' as const,
            };

            const compressedFile = await imageCompression(file, options);

            const formData = new FormData();
            formData.append('file', compressedFile, compressedFile.name.replace(/\.[^/.]+$/, ".webp"));
            formData.append('folder', folder);

            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            console.log('Finalizing upload, response processing...');
            const data = await response.json();

            if (data.success && data.url) {
                console.log('Upload success, URL:', data.url);
                onChange(data.url);
            } else {
                console.error('Upload failed:', data.error);
                setError(data.error || '업로드 실패');
            }
        } catch (err: any) {
            console.error(err);
            setError('이미지 처리 또는 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            await processAndUpload(file);
        }
    };

    return (
        <div class="mb-4">
            <label class="block text-sm font-bold text-gray-700 mb-2">{label}</label>

            {value ? (
                <div class="relative rounded-lg overflow-hidden border border-gray-200 group bg-gray-50 flex justify-center items-center p-2 h-40">
                    <img src={value} alt="Uploaded preview" class="max-h-full object-contain" />
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            class="px-3 py-1.5 bg-white text-dark text-xs font-bold rounded cursor-pointer border-none hover:bg-gray-100"
                        >
                            변경
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            class="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded cursor-pointer border-none hover:bg-red-600"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <div class="flex flex-col items-center">
                            <i class="fas fa-spinner fa-spin text-primary text-2xl mb-2"></i>
                            <span class="text-sm text-gray-500">이미지 최적화 및 업로드 중...</span>
                        </div>
                    ) : (
                        <>
                            <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                            <p class="text-sm text-gray-600 mb-1">클릭하거나 이미지를 드래그 앤 드롭 하세요.</p>
                            <p class="text-[11px] text-gray-400">자동으로 WebP 포맷과 최적 크기(Max 1920px)로 압축됩니다.</p>
                        </>
                    )}
                </div>
            )}

            {error && <p class="text-xs text-red-500 mt-1.5">{error}</p>}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                class="hidden"
            />
        </div>
    );
}
