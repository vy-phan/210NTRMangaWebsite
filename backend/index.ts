import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/mongo';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import các router
import mangaRouter from './routers/MangaRouters';
import userRoutes from './routers/UserRouters';
import genreRoutes from './routers/GenreRouters';
import chapterRouter from './routers/ChapterRouters';
import imageUploadRouter from './routers/ImageUploadRouters';
import bannerRouter from './routers/BannerRoutes';
import promotionRouter from './routers/PromotionRoutes';
import notificationRouter from './routers/NotificationRouters';
import { startKeepAliveJob } from './utils/cronJob';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// CORS Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGINS || 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

// Body & Cookie Parsers Middleware
app.use(express.json({ limit: '500kb' }));
app.use(cookieParser());

// API Routes Middleware
app.use('/api/manga', mangaRouter);
app.use('/api/genres', genreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chapters', chapterRouter);
app.use('/api/images', imageUploadRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/promotions', promotionRouter);
app.use('/api/notifications', notificationRouter);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.resolve(__dirname, '..', 'frontend', 'dist');

  // Phục vụ các file tĩnh trước
  app.use(express.static(frontendDistPath));

  // "Catch-all" route: Cho BẤT KỲ request nào không khớp với API và file tĩnh ở trên,
  // trả về file index.html.
  app.use((req: express.Request, res: express.Response) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'));
  });

} else {
  app.get('/', (req: express.Request, res: express.Response) => {
    res.send('API is running in development mode...');
  });
}

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    await connectDB();

    // Khởi động Cron Job giữ server hoạt động (Render Keep-alive)
    startKeepAliveJob();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();