"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the .env file');
        }
        await mongoose_1.default.connect(mongoUri);
        console.log('MongoDB connected successfully.');
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error in connect Mongo DB: ", error.message);
        }
        else {
            console.log("An unknown error occurred while connecting to MongoDB.");
        }
        process.exit(1); // Thoát nếu không kết nối được DB
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=mongo.js.map