import { CronJob } from 'cron';
import https from 'https';
import http from 'http';

// Chạy mỗi 14 phút từ 8:00 sáng đến 18:00 (6:00 chiều) theo giờ Việt Nam
// Cron expression: */14 (phút 0, 14, 28, 42...), 8-18 (giờ 8 đến 18)
const SCHEDULE = '0 */14 8-18 * * *';

const ping = (url: string) => {
    if (!url) {
        console.warn('[CRON] API_URL is not set. Skip ping.');
        return;
    }

    console.log(`[CRON] Pinging ${url}...`);

    const client = url.startsWith('http://') ? http : https;

    client.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('[CRON] Keep-alive ping OK');
        } else {
            console.log(`[CRON] Keep-alive ping failed: ${res.statusCode}`);
        }
    }).on('error', (e) => {
        console.error('[CRON] Error while sending request:', e.message);
    });
};

export const startKeepAliveJob = () => {
    // Ưu tiên sử dụng RENDER_EXTERNAL_URL (biến môi trường tự động của Render)
    let API_URL = process.env.RENDER_EXTERNAL_URL;

    // Nếu không có RENDER_EXTERNAL_URL (ví dụ chạy local), fallback về localhost
    if (!API_URL) {
        const PORT = process.env.PORT || 7000;
        API_URL = `http://localhost:${PORT}`;
        console.log('[CRON] RENDER_EXTERNAL_URL not found, using localhost fallback.');
    }

    const timeZone = 'Asia/Ho_Chi_Minh';

    const job = new CronJob(
        SCHEDULE,
        function () {
            ping(API_URL!);
        },
        null,
        true, // start automatically
        timeZone
    );

    console.log(`[CRON] Keep-alive job started. Schedule: ${SCHEDULE}, TZ: ${timeZone}, Target: ${API_URL}`);
    return job;
};
