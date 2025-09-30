import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { toast } from 'react-hot-toast';
import { FiX, FiUploadCloud, FiTrash2, FiCopy, FiClipboard } from 'react-icons/fi';
import { deleteImageAPI, getImagesByMangaNameAPI, uploadImagesAPI } from '../../api/imageUpload';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ImageLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    mangaName: string;
    onImagesUploaded?: (newImages: ImageUpload[]) => void;
}

// Caching: Lưu trữ dữ liệu ngoài component để nó không bị reset khi component unmount
const imageCache = new Map<string, ImageUpload[]>();

// Component tối ưu cho từng ảnh với memo để tránh re-render không cần thiết
const ImageCard = memo(({ 
    image, 
    index, 
    onDelete, 
    onCopyUrl, 
    onDoubleClick 
}: { 
    image: ImageUpload; 
    index: number; 
    onDelete: (id: string) => void; 
    onCopyUrl: (url: string) => void; 
    onDoubleClick: (index: number) => void;
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    // Sử dụng Intersection Observer để lazy load ảnh
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px', // Load trước 100px
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={imgRef}
            className="card card-compact bg-base-100 shadow-xl group relative overflow-hidden cursor-pointer"
            onDoubleClick={() => onDoubleClick(index)}
        >
            <figure className="aspect-square bg-base-200">
                {isInView ? (
                    <img 
                        src={image.secure_url} 
                        alt="Manga page" 
                        className={`aspect-square object-cover transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="loading loading-spinner loading-sm"></span>
                    </div>
                )}
            </figure>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center gap-2">
                <div className="tooltip" data-tip="Sao chép URL">
                    <button 
                        className="btn btn-circle btn-sm btn-info" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyUrl(image.secure_url);
                        }}
                    >
                        <FiCopy />
                    </button>
                </div>
                <div className="tooltip" data-tip="Xóa ảnh">
                    <button 
                        className="btn btn-circle btn-sm btn-error" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(image._id);
                        }}
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    );
});

ImageCard.displayName = 'ImageCard';

const ImageLibraryModal = ({ isOpen, onClose, mangaName, onImagesUploaded }: ImageLibraryModalProps) => {
    const [images, setImages] = useState<ImageUpload[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    // State cho Lightbox
    const [lightboxIndex, setLightboxIndex] = useState(-1);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // Ref để theo dõi xem dữ liệu đã được fetch lần đầu chưa
    const hasFetched = useRef(false);

    // Sử dụng useCallback để không tạo lại hàm fetchImages mỗi lần render
    const fetchImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getImagesByMangaNameAPI(mangaName);
            // Sắp xếp ảnh mới nhất lên đầu để hiển thị
            const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setImages(sortedData);
            // Lưu vào cache
            imageCache.set(mangaName, sortedData);
            hasFetched.current = true;
        } catch (error) {
            toast.error(`Không thể tải thư viện ảnh cho "${mangaName}".`);
            setImages([]);
        } finally {
            setIsLoading(false);
        }
    }, [mangaName]);


    // Tối ưu Caching trong useEffect
    useEffect(() => {
        if (isOpen && mangaName) {
            // Kiểm tra cache trước
            if (imageCache.has(mangaName)) {
                // Nếu có cache, dùng ngay lập tức
                setImages(imageCache.get(mangaName)!);
                hasFetched.current = true;
            } else {
                // Nếu không có cache, fetch mới
                fetchImages();
            }
        }
    }, [isOpen, mangaName, fetchImages]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(e.target.files);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            toast.error("Vui lòng chọn ít nhất một file ảnh.");
            return;
        }
        setIsUploading(true);
        
        const uploadPromise = uploadImagesAPI(mangaName, selectedFiles);

        toast.promise(uploadPromise, {
            loading: `Đang tải lên ${selectedFiles.length} ảnh...`,
            success: (newImages) => {
                const updatedImages = [...newImages, ...images];
                setImages(updatedImages);
                // Cập nhật lại cache
                imageCache.set(mangaName, updatedImages);

                if (fileInputRef.current) fileInputRef.current.value = '';
                setSelectedFiles(null);
                if (onImagesUploaded) onImagesUploaded(newImages);
                return 'Tải ảnh lên thành công!';
            },
            error: (err) => err.message || 'Lỗi khi tải ảnh lên.',
        }).finally(() => {
            setIsUploading(false);
        });
    };

    const handleDelete = useCallback((imageId: string) => {
        if (!window.confirm("Bạn có chắc muốn xóa ảnh này vĩnh viễn?")) return;

        const deletePromise = deleteImageAPI(imageId);
        toast.promise(deletePromise, {
            loading: 'Đang xóa ảnh...',
            success: () => {
                setImages(prev => {
                    const updatedImages = prev.filter(img => img._id !== imageId);
                    imageCache.set(mangaName, updatedImages);
                    return updatedImages;
                });
                return 'Xóa ảnh thành công!';
            },
            error: (err) => err.message || 'Lỗi khi xóa ảnh.',
        });
    }, [mangaName]);

    const handleCopyUrl = useCallback((url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép URL!");
    }, []);
    
    // =============================================================
    // CHỨC NĂNG MỚI: SAO CHÉP HÀNG LOẠT THEO ĐỊNH DẠNG INDEX:URL
    // =============================================================
    const handleCopyAllAsIndexed = () => {
        if (images.length === 0) {
            toast.error("Không có ảnh nào để sao chép.");
            return;
        }
        // 1. Sắp xếp ảnh từ CŨ NHẤT đến MỚI NHẤT để index đúng thứ tự thời gian
        const sortedForIndex = [...images].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        // 2. Tạo chuỗi định dạng "index:url"
        const indexedUrls = sortedForIndex.map((image, index) => `${index}:${image.secure_url}`).join('\n');
        
        // 3. Sao chép vào clipboard
        navigator.clipboard.writeText(indexedUrls);
        toast.success(`Đã sao chép ${sortedForIndex.length} URL theo định dạng index!`);
    };
    
    // =============================================================
    // CHỨC NĂNG MỚI: MỞ LIGHTBOX KHI DOUBLE CLICK
    // =============================================================
    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
    }, []);


    if (!isOpen) return null;

    return (
        <>
            <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
                <div className="modal-box w-11/12 max-w-4xl">
                    {/* Header */}
                    <header className="flex justify-between items-center p-4 border-b border-base-300">
                        <div>
                            <h3 className="font-bold text-lg">Thư viện ảnh</h3>
                            <p className="text-sm opacity-70">Truyện: {mangaName}</p>
                        </div>
                        <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}><FiX /></button>
                    </header>
                    
                    {/* Body */}
                    <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto" style={{ 
                        willChange: 'scroll-position',
                        transform: 'translateZ(0)',
                        WebkitOverflowScrolling: 'touch'
                    }}>
                        {/* Upload Section */}
                        <div className="p-4 border border-dashed border-base-300 rounded-box flex flex-col md:flex-row items-center gap-4">
                            <input
                                ref={fileInputRef} type="file" multiple
                                accept="image/png, image/jpeg, image/webp, image/gif"
                                className="file-input file-input-bordered w-full md:flex-grow"
                                onChange={handleFileChange}
                            />
                            <button className="btn btn-primary w-full md:w-auto" onClick={handleUpload} disabled={isUploading || !selectedFiles}>
                                {isUploading ? <span className="loading loading-spinner"></span> : <FiUploadCloud />}
                                Tải Lên {selectedFiles ? `(${selectedFiles.length})` : ''}
                            </button>
                        </div>

                        <div className="divider flex items-center justify-between gap-4">
                            <span>Ảnh hiện có ({images.length})</span>
                            {/* Nút Copy hàng loạt */}
                            <button className="btn btn-sm btn-outline" onClick={handleCopyAllAsIndexed} disabled={images.length === 0}>
                                <FiClipboard /> Copy All (index:url)
                            </button>
                        </div>

                        {/* Image Grid */}
                        {isLoading ? (
                            <div className="text-center p-8"><span className="loading loading-spinner loading-lg"></span></div>
                        ) : images.length === 0 ? (
                            <div className="text-center py-10 bg-base-200 rounded-lg">Thư viện trống.</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {images.map((image, index) => (
                                    <ImageCard
                                        key={image._id}
                                        image={image}
                                        index={index}
                                        onDelete={handleDelete}
                                        onCopyUrl={handleCopyUrl}
                                        onDoubleClick={openLightbox}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop"><button onClick={onClose}>close</button></form>
            </dialog>
            {/* Lightbox Component */}
            <Lightbox
                open={lightboxIndex > -1}
                close={() => setLightboxIndex(-1)}
                // Tạo một mảng các slide từ danh sách ảnh
                slides={images.map(img => ({ src: img.secure_url }))}
                // Bắt đầu từ ảnh được click
                index={lightboxIndex}
            />
        </>
    );
};

export default ImageLibraryModal;