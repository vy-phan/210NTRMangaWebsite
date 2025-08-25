import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    supabaseId: {
        type: String,
        required: true,
        unique: true,
        index: true,
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
    providers: {
        type: String,
        enum: ['google', 'discord'],
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;