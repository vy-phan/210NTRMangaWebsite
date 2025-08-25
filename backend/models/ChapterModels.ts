import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    pageNumber: {
        type: Number,
        required: true
    }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
        index: true
    },
    images: [imageSchema]
}, { timestamps: true });

chapterSchema.index({ manga: 1, number: 1 }, { unique: true });

const Chapter = mongoose.model('Chapter', chapterSchema);
export default Chapter;