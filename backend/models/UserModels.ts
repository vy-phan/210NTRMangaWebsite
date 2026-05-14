import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true  // sẽ gây lỗi cho 2 user cũ, nên để optional hoặc tự add password cho họ sau đó set lại required
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;