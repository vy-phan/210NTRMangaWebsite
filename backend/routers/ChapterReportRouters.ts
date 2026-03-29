import express from 'express';
import { 
    createReport, 
    getAllReports, 
    updateReportStatus, 
    deleteReport 
} from '../controllers/ChapterReportControllers';
import { adminOnly, protectRoute } from '../middleware/auth';

const router = express.Router();

// Route người dùng công khai
router.post('/', createReport);

// Route Admin quản lý nội bộ
router.get('/',protectRoute, adminOnly, getAllReports);
router.patch('/:id',protectRoute, adminOnly, updateReportStatus);
router.delete('/:id',protectRoute, adminOnly, deleteReport);

export default router;
