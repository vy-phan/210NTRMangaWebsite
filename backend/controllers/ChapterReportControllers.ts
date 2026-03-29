import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ChapterReport from '../models/ChapterReportModels';
import mongoose from 'mongoose';

// @desc    Gửi báo cáo lỗi mới
// @route   POST /api/reports
// @access  Public (hoặc Private tùy bạn cấu hình)
export const createReport = asyncHandler(async (req: Request, res: Response) => {
    const { mangaId, chapterId, reporter, errorType, description } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!mangaId || !chapterId || !errorType || !description) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin báo cáo." });
        return;
    }

    // Kiểm tra spam: 1 báo cáo/chapter/phút từ cùng 1 IP
    const recentReport = await ChapterReport.findOne({
        ipAddress,
        chapterId,
        createdAt: { $gte: new Date(Date.now() - 60000) }
    });

    if (recentReport) {
        res.status(429).json({ success: false, message: "Bạn đang gửi báo cáo quá nhanh. Vui lòng đợi một lát." });
        return;
    }

    const newReport = await ChapterReport.create({
        mangaId,
        chapterId,
        reporter: reporter || null,
        errorType,
        description,
        ipAddress
    });

    res.status(201).json({ success: true, data: newReport });
});

// @desc    Lấy danh sách báo cáo (Cho Admin)
// @route   GET /api/reports
// @access  Private/Admin
export const getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const reports = await ChapterReport.find()
        .populate('mangaId', 'title')
        .populate('chapterId', 'number title')
        .populate('reporter', 'displayName email')
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reports });
});

// @desc    Cập nhật trạng thái báo cáo
// @route   PATCH /api/reports/:id
// @access  Private/Admin
export const updateReportStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
    }

    const updatedReport = await ChapterReport.findByIdAndUpdate(
        id,
        { status, adminNote },
        { new: true, runValidators: true }
    );

    if (!updatedReport) {
        res.status(404).json({ success: false, message: "Không tìm thấy báo cáo." });
        return;
    }

    res.status(200).json({ success: true, data: updatedReport });
});

// @desc    Xóa báo cáo lỗi (Chỉ khi đã xử lý xong: fixed hoặc rejected)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
export const deleteReport = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
    }

    const report = await ChapterReport.findById(id);

    if (!report) {
        res.status(404).json({ success: false, message: "Không tìm thấy báo cáo lỗi." });
        return;
    }

    // Điều kiện xóa: chỉ xóa khi đã fixed hoặc rejected
    if (report.status === 'pending') {
        res.status(400).json({
            success: false,
            message: "Chỉ có thể xóa các báo cáo đã xử lý (Đã sửa hoặc Từ chối). Báo cáo đang chờ dữ liệu không được xóa."
        });
        return;
    }

    await report.deleteOne();

    res.status(200).json({ success: true, message: "Đã dọn dẹp báo cáo lỗi thành công." });
});
