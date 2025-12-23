import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    bannerImg: {
        type: String,
        required: true
    },
    charImg: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
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

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;