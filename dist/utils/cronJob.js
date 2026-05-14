"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startKeepAliveJob = void 0;
const cron_1 = require("cron");
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
// Chạy mỗi 14 phút từ 8:00 sáng đến 18:00 (6:00 chiều) theo giờ Việt Nam
// Cron expression: */14 (phút 0, 14, 28, 42...), 8-18 (giờ 8 đến 18)
const SCHEDULE = '0 */14 8-18 * * *';
const ping = (url) => {
    if (!url) {
        console.warn('[CRON] API_URL is not set. Skip ping.');
        return;
    }
    console.log(`[CRON] Pinging ${url}...`);
    const client = url.startsWith('http://') ? http_1.default : https_1.default;
    client.get(url, (res) => {
        if (res.statusCode === 200) {
            console.log('[CRON] Keep-alive ping OK');
        }
        else {
            console.log(`[CRON] Keep-alive ping failed: ${res.statusCode}`);
        }
    }).on('error', (e) => {
        console.error('[CRON] Error while sending request:', e.message);
    });
};
const startKeepAliveJob = () => {
    // Ưu tiên sử dụng RENDER_EXTERNAL_URL (biến môi trường tự động của Render)
    let API_URL = process.env.RENDER_EXTERNAL_URL;
    // Nếu không có RENDER_EXTERNAL_URL (ví dụ chạy local), fallback về localhost
    if (!API_URL) {
        const PORT = process.env.PORT || 7000;
        API_URL = `http://localhost:${PORT}`;
        console.log('[CRON] RENDER_EXTERNAL_URL not found, using localhost fallback.');
    }
    const timeZone = 'Asia/Ho_Chi_Minh';
    const job = new cron_1.CronJob(SCHEDULE, function () {
        ping(API_URL);
    }, null, true, // start automatically
    timeZone);
    console.log(`[CRON] Keep-alive job started. Schedule: ${SCHEDULE}, TZ: ${timeZone}, Target: ${API_URL}`);
    return job;
};
exports.startKeepAliveJob = startKeepAliveJob;
//# sourceMappingURL=cronJob.js.map