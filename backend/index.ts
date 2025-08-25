import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/mongo';
import cookieParser from 'cookie-parser';
import mangaRouter from './routers/MangaRouters';
import userRoutes from './routers/UserRouters';
import genreRoutes from './routers/GenreRouters';
import chapterRouter from './routers/ChapterRouters';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGINS || 'http://localhost:5173',
  credentials: true,

};

app.use(cors(corsOptions));


// Body & cookies
app.use(express.json({ limit: '500kb' }));
app.use(cookieParser());

// Routes
app.use('/api/manga', mangaRouter);
app.use('/api/genres', genreRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chapters', chapterRouter);

// Global error handler (đặt SAU routes)
app.use((err: any, req: any, res: any, next: any) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error('Error:', err?.message);
  if (err?.stack) console.error(err.stack);
  res.status(status).json({
    success: false,
    message: err?.message || 'Internal Server Error',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
