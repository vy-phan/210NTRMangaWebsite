import mongoose from "mongoose";

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    description: {
        type: String
    }, 
    status: {
        type: String,
        enum: ['Ongoing', 'Completed', 'Cancelled'],
    }, 
    genres: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Genre',
            index: true
        }
    ],
    poster: {
        type: String
    }, 
},{timestamps: true})

const Manga = mongoose.model('Manga',mangaSchema)
export default Manga