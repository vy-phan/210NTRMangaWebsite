import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/UserModels';


declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}


export const protectRoute = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // 1. Lấy token từ cookie HOẶC từ Authorization Header (cho tool scraper)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // 2. Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

      // 3. Token hợp lệ, tìm user profile
      const userProfile = await User.findById(decoded.id).select('-password -__v');

      if (!userProfile) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // 4. Gán user
      req.user = userProfile;

      next();
      return; // Cần return để không chạy xuống check !token bên dưới
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// (Tùy chọn) Middleware kiểm tra quyền Admin
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};