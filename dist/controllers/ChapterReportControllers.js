"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.updateReportStatus = exports.getAllReports = exports.createReport = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ChapterReportModels_1 = __importDefault(require("../models/ChapterReportModels"));
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Gửi báo cáo lỗi mới
// @route   POST /api/reports
// @access  Public (hoặc Private tùy bạn cấu hình)
exports.createReport = (0, express_async_handler_1.default)(async (req, res) => {
    const { mangaId, chapterId, reporter, errorType, description } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!mangaId || !chapterId || !errorType || !description) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp đầy đủ thông tin báo cáo." });
        return;
    }
    // Kiểm tra spam: 1 báo cáo/chapter/phút từ cùng 1 IP
    const recentReport = await ChapterReportModels_1.default.findOne({
        ipAddress,
        chapterId,
        createdAt: { $gte: new Date(Date.now() - 60000) }
    });
    if (recentReport) {
        res.status(429).json({ success: false, message: "Bạn đang gửi báo cáo quá nhanh. Vui lòng đợi một lát." });
        return;
    }
    const newReport = await ChapterReportModels_1.default.create({
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
exports.getAllReports = (0, express_async_handler_1.default)(async (req, res) => {
    const reports = await ChapterReportModels_1.default.find()
        .populate('mangaId', 'title')
        .populate('chapterId', 'number title')
        .populate('reporter', 'displayName email')
        .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
});
// @desc    Cập nhật trạng thái báo cáo
// @route   PATCH /api/reports/:id
// @access  Private/Admin
exports.updateReportStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
    }
    const updatedReport = await ChapterReportModels_1.default.findByIdAndUpdate(id, { status, adminNote }, { new: true, runValidators: true });
    if (!updatedReport) {
        res.status(404).json({ success: false, message: "Không tìm thấy báo cáo." });
        return;
    }
    res.status(200).json({ success: true, data: updatedReport });
});
// @desc    Xóa báo cáo lỗi (Chỉ khi đã xử lý xong: fixed hoặc rejected)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
exports.deleteReport = (0, express_async_handler_1.default)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
    }
    const report = await ChapterReportModels_1.default.findById(id);
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
//# sourceMappingURL=ChapterReportControllers.js.map