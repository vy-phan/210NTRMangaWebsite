import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Promotion from '../models/PromotionModels';
import mongoose from 'mongoose';

/**
 * @desc    Get all promotions
 * @route   GET /api/promotions
 * @access  Public
 */
export const getPromotions = asyncHandler(async (req: Request, res: Response) => {
    const filter: any = { active: true };

    const promotions = await Promotion.find(filter).sort({ priority: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: promotions });
});

/**
 * @desc    Get promotion by ID
 * @route   GET /api/promotions/:id
 * @access  Private/Admin
 */
export const getPromotionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }

    const promotion = await Promotion.findById(id);
    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }

    res.status(200).json({ success: true, data: promotion });
});

/**
 * @desc    Create a new promotion
 * @route   POST /api/promotions
 * @access  Private/Admin
 */
export const createPromotion = asyncHandler(async (req: Request, res: Response) => {
    const { title, image, link } = req.body;

    if (!title || !image || !link) {
        res.status(400);
        throw new Error("Please provide title, image, and link");
    }

    const promotion = await Promotion.create(req.body);
    res.status(201).json({ success: true, data: promotion });
});

/**
 * @desc    Update a promotion
 * @route   PUT /api/promotions/:id
 * @access  Private/Admin
 */
export const updatePromotion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }

    const promotion = await Promotion.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }

    res.status(200).json({ success: true, data: promotion });
});

/**
 * @desc    Delete a promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private/Admin
 */
export const deletePromotion = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400);
        throw new Error("Invalid promotion ID");
    }

    const promotion = await Promotion.findByIdAndDelete(id);

    if (!promotion) {
        res.status(404);
        throw new Error("Promotion not found");
    }

    res.status(200).json({ success: true, message: "Promotion removed" });
});
