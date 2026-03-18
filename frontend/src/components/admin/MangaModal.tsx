import { useState, useEffect } from 'react';
import { slugify } from '../../utils/slugify';
import { getAllGenresAPI } from '../../api/genreApi';
import { toast } from 'react-hot-toast';

interface MangaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (manga: any) => void;
    initialData: Manga | null;
    mode: 'add' | 'edit';
}

const MangaModal = ({ isOpen, onClose, onSave, initialData, mode }: MangaModalProps) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Ongoing',
        poster: '',
        category: 'Manga',
        genres: [] as string[],
        author: '',
        artist: '',
        externalUrl: '',
    });
    const [allGenres, setAllGenres] = useState<Genre[]>([]);
    const [isLoadingGenres, setIsLoadingGenres] = useState(true);
    const [genreSearch, setGenreSearch] = useState('');
    const generatedSlug = slugify(formData.title);


    useEffect(() => {
        if (isOpen) {
            const fetchGenres = async () => {
                try {
                    setIsLoadingGenres(true);
                    const genresData = await getAllGenresAPI();
                    setAllGenres(genresData);
                } catch (error) {
                    toast.error("Không thể tải danh sách thể loại cho form.");
                } finally {
                    setIsLoadingGenres(false);
                }
            };
            fetchGenres();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && mode === 'edit' && initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || '',
                status: initialData.status || 'Ongoing',
                poster: initialData.poster || '',
                category: (initialData as any).category || 'Manga',
                genres: (initialData.genres?.map(g => typeof g === 'string' ? g : g._id) || []) as string[],
                author: initialData.author || '',
                artist: initialData.artist || '',
                externalUrl: initialData.externalUrl || '',
            });
        } else {
            setFormData({ title: '', description: '', status: 'Ongoing', poster: '', category: 'Manga', genres: [], author: '', artist: '', externalUrl: '' });
        }
    }, [isOpen, mode, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenreToggle = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.includes(genreId)
                ? prev.genres.filter(id => id !== genreId)
                : [...prev.genres, genreId]
        }));
    };

    const removeGenre = (genreId: string) => {
        setFormData(prev => ({
            ...prev,
            genres: prev.genres.filter(id => id !== genreId)
        }));
    };

    const getSelectedGenresNames = () => {
        return allGenres.filter(g => formData.genres.includes(g._id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, slug: generatedSlug });
    };

    const filteredGenres = allGenres.filter(genre =>
        genre.name.toLowerCase().includes(genreSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <dialog className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-2xl text-base-content">
                        {mode === 'add' ? ' Thêm Truyện Mới' : ' Chỉnh Sửa Truyện'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-circle btn-ghost"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title & Poster Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Tên Truyện
                                </span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="input input-bordered focus:input-primary"
                                placeholder="Nhập tên truyện..."
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Poster (URL)
                                </span>
                            </label>
                            <input
                                type="url"
                                name="poster"
                                value={formData.poster}
                                onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="https://example.com/poster.jpg"
                            />
                        </div>
                    </div>

                    {/* Slug & Status Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Slug
                                </span>
                            </label>
                            <input
                                type="text"
                                value={generatedSlug}
                                readOnly
                                className="input input-bordered bg-base-200 cursor-not-allowed"
                                placeholder="Slug tự động tạo"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Trạng thái
                                </span>
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="select select-bordered focus:select-primary"
                            >
                                <option value="Ongoing">Đang tiến hành</option>
                                <option value="Completed">Đã hoàn thành</option>
                                <option value="Cancelled">Đã hủy</option>
                            </select>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Loại truyện
                                </span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="select select-bordered focus:select-primary"
                            >
                                <option value="Manga">Manga</option>
                                <option value="Manhwa">Manhwa</option>
                            </select>
                        </div>
                    </div>

                    {/* Author & Artist Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Tác giả
                                </span>
                            </label>
                            <input
                                type="text"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="Nhập tên tác giả..."
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Họa sĩ
                                </span>
                            </label>
                            <input
                                type="text"
                                name="artist"
                                value={formData.artist}
                                onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="Nhập tên họa sĩ..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Link Raw (Raw URL)
                                </span>
                            </label>
                            <input
                                type="url"
                                name="externalUrl"
                                value={formData.externalUrl}
                                onChange={handleChange}
                                className="input input-bordered focus:input-primary"
                                placeholder="https://raw-source.com/manga/..."
                            />
                        </div>
                    </div>

                    {/* Custom Genre Selection */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Thể loại
                            </span>
                            <span className="label-text-alt">
                                {formData.genres.length > 0 ? `Đã chọn ${formData.genres.length} thể loại` : 'Chưa chọn thể loại nào'}
                            </span>
                        </label>

                        {/* Selected Genres Display */}
                        {formData.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-base-200 rounded-lg">
                                {getSelectedGenresNames().map(genre => (
                                    <div key={genre._id} className="badge badge-primary gap-2">
                                        {genre.name}
                                        <button
                                            type="button"
                                            onClick={() => removeGenre(genre._id)}
                                            className="btn btn-ghost btn-xs p-0 w-4 h-4"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Custom Dropdown */}
                        <div className="dropdown dropdown-bottom w-full">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-outline w-full justify-between"
                            >
                                <span>{isLoadingGenres ? 'Đang tải thể loại...' : 'Chọn thể loại'}</span>
                                <svg
                                    className="w-4 h-4" // Bỏ logic rotate vì CSS của DaisyUI sẽ lo
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            <div tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-full border border-base-300 z-10">
                                {/* Ô Tìm Kiếm (không đổi) */}
                                <div className="p-2">
                                    <input
                                        type="text"
                                        placeholder="Tìm thể loại..."
                                        className="input input-sm input-bordered w-full"
                                        value={genreSearch}
                                        onChange={(e) => setGenreSearch(e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                    />
                                </div>
                                <div className="divider my-0"></div>

                                {/* Danh sách thể loại đã được lọc - Hiển thị theo nhiều cột dọc */}
                                <div className="max-h-48 overflow-y-auto p-1">
                                    {isLoadingGenres ? (
                                        <span className="text-base-content/50 p-2 italic">Đang tải...</span>
                                    ) : filteredGenres.length > 0 ? (
                                        <div className="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
                                            {filteredGenres.map(genre => (
                                                <div
                                                    key={genre._id}
                                                    // Sử dụng class tùy chỉnh của chúng ta
                                                    className="tooltip tooltip-bottom description-tooltip z-999 "
                                                    data-tip={genre.description || 'Không có mô tả.'}
                                                >
                                                    <a
                                                        onClick={(e) => { e.preventDefault(); handleGenreToggle(genre._id); }}
                                                        className={`btn btn-sm rounded-full w-full cursor-pointer ${formData.genres.includes(genre._id) ? 'btn-info' : 'btn-outline btn-primary'}`}
                                                    >
                                                        <span className="truncate">{genre.name}</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-base-content/50 p-2">Không tìm thấy kết quả.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-control ">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Mô tả
                            </span>
                            <span className="label-text-alt">{formData.description.length}/500 ký tự</span>
                        </label>
                        <br />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="textarea textarea-bordered w-full h-40 focus:textarea-primary resize-none"
                            placeholder="Nhập mô tả về truyện..."
                            maxLength={500}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={onClose}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!formData.title.trim()}
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {mode === 'add' ? 'Thêm Truyện' : 'Cập Nhật'}
                        </button>
                    </div>
                </form>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
};

export default MangaModal;