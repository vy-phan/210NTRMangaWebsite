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
    BANNER_DEFAULT_1: '/banner/default/1.webp',
    BANNER_DEFAULT_2: '/banner/default/2.webp',
    BANNER_DEFAULT_3: '/banner/default/3.webp',

    // ảnh 404 
    NOT_FOUND: '/notFound.webp',
};
