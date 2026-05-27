/**
 * FILE QUẢN LÝ TẤT CẢ ĐƯỜNG DẪN ẢNH (ASSETS) CỦA HỆ THỐNG
 * Giúp dễ dàng thay đổi ảnh tại một nơi duy nhất.
 */

export const ASSETS = {
    // Logo cho các theme khác nhau
    LOGO_LIGHT: '/logoLight.png',
    LOGO_NIGHT: '/logoNight.png',

    // Ảnh bìa (Covers)
    AUTH_COVER: '/cover.png',

    // Ảnh mặc định/Placeholder
    DEFAULT_AVATAR: (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,

    // Ảnh thẻ cover truyện mặc định 
    DEFAULT_COVER: '/place-doro.webp',

    // Ảnh 4 banner mặc định
    BANNER_DEFAULT_1: 'https://storage-ct.lrclib.net/file/cuutruyen/uploads/manga/3374/panorama/processed-2f920c4a8796afd0b189b3bcbc5bed69.jpg',
    BANNER_DEFAULT_2: 'https://storage-ct.lrclib.net/file/cuutruyen/uploads/manga/673/panorama/processed-2ccf549fa890f878ad8da26661fdcca6.jpg',
    BANNER_DEFAULT_3: 'https://storage-ct.lrclib.net/file/cuutruyen/uploads/manga/1528/panorama/processed-4bee00dbb2134cd6ae288182ef9edc9f.jpg',
};
