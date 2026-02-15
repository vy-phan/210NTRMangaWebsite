import { CronJob } from 'cron';
import https from 'https';

// Chạy mỗi 14 phút từ 8:00 sáng đến 18:00 (6:00 chiều) theo giờ Việt Nam
// Cron expression: */14 (phút 0, 14, 28, 42...), 8-18 (giờ 8 đến 18)
const SCHEDULE = '0 */14 8-18 * * *';

const ping = (url: string) => {
    if (!url) {
        console.warn('[CRON] API_URL is not set. Skip ping.');
        return;
    }

    console.log(`[CRON] Pinging ${url}...`);

    https.get(url, (res) => {
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
    const API_URL = process.env.PORT;
    const timeZone = 'Asia/Ho_Chi_Minh';

    if (!API_URL) {
        console.warn('[CRON] PORT is not set. Cron job will not ping.');
        return;
    }

    const job = new CronJob(
        SCHEDULE,
        function () {
            ping(API_URL);
        },
        null,
        true, // start automatically
        timeZone
    );

    console.log(`[CRON] Keep-alive job started. Schedule: ${SCHEDULE}, TZ: ${timeZone}, Target: ${API_URL}`);
    return job;
};
