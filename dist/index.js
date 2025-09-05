"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongo_1 = require("./config/mongo");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
// Import các router
const MangaRouters_1 = __importDefault(require("./routers/MangaRouters"));
const UserRouters_1 = __importDefault(require("./routers/UserRouters"));
const GenreRouters_1 = __importDefault(require("./routers/GenreRouters"));
const ChapterRouters_1 = __importDefault(require("./routers/ChapterRouters"));
const ImageUploadRouters_1 = __importDefault(require("./routers/ImageUploadRouters"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 7000;
// CORS Middleware
const corsOptions = {
    origin: process.env.CORS_ORIGINS || 'http://localhost:5173',
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Body & Cookie Parsers Middleware
app.use(express_1.default.json({ limit: '500kb' }));
app.use((0, cookie_parser_1.default)());
// API Routes Middleware
app.use('/api/manga', MangaRouters_1.default);
app.use('/api/genres', GenreRouters_1.default);
app.use('/api/users', UserRouters_1.default);
app.use('/api/chapters', ChapterRouters_1.default);
app.use('/api/images', ImageUploadRouters_1.default);
// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path_1.default.resolve(__dirname, '..', 'frontend', 'dist');
    // Phục vụ các file tĩnh trước
    app.use(express_1.default.static(frontendDistPath));
    // "Catch-all" route: Cho BẤT KỲ request nào không khớp với API và file tĩnh ở trên,
    // trả về file index.html.
    app.use((req, res) => {
        res.sendFile(path_1.default.resolve(frontendDistPath, 'index.html'));
    });
}
else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}
// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});
// Start Server Function
const startServer = async () => {
    try {
        await (0, mongo_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map