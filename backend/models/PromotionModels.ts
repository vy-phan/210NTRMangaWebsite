import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    views: {
        type: String,
        default: '0'
    },
    active: {
        type: Boolean,
        default: true
    },
    priority: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;
