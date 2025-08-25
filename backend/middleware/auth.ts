import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../config/supabase';
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

  // 1. Lấy token từ header 'Authorization'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 2. Xác thực token với Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }

      // 3. Token hợp lệ, tìm user profile tương ứng trong MongoDB
      // Chúng ta sẽ dùng supabaseId đã lưu để tìm kiếm
      const userProfile = await User.findOne({ supabaseId: supabaseUser.id }).select('-__v'); // select('-__v') để bỏ trường __v

      if (!userProfile) {
        // Trường hợp này hiếm khi xảy ra nếu luồng sync hoạt động tốt
        // Nhưng vẫn cần xử lý để đảm bảo an toàn
        res.status(404);
        throw new Error('User profile not found in our database. Please sync your account.');
      }

      // 4. Gán user profile từ MongoDB vào request để các controller sau có thể sử dụng
      req.user = userProfile;

      next(); // Cho phép đi tiếp
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