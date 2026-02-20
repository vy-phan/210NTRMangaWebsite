import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  secure_url: {
    type: String,
    required: true,
    unique: true,
  },
  public_id: {
    type: String,
    required: true,
    unique: true,
  },
  folder: {
    type: String,
    required: true,
    index: true,
  },
  mangaName: {
    type: String,
  },
  chapter: {
    type: String, // Có thể có hoặc không
  }
}, { timestamps: true });

const ImageUpload = mongoose.model('ImageUpload', ImageSchema);
export default ImageUpload;