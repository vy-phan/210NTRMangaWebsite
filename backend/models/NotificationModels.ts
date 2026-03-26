import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    content: string;
    isActive: boolean;
}

const NotificationSchema: Schema = new Schema(
    {
        content: {
            type: String,
            required: [true, 'Please provide notification content']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);


export default mongoose.model<INotification>('Notification', NotificationSchema);
