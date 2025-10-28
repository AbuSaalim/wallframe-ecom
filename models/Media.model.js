import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    asset_id: {
        type: String,
        required:true,
        trim:true,
    },
    public_id: {
        type: String,
        required:true,
        trim:true,
    },
    path: {
        type: String,
        required:true,
        trim:true,
    },
    thumbnail_url: {
        type: String,
        required:true,
        trim:true,
    },
    alt: {
        type: String,
        required:true,
    },
    title: {
        type: String,
        required:true,
    },
    deletedAt: {
        type: Date,
        default:null,
        index: true
    },
   
}, {timestamps:true})



const MediaModel = mongoose.models.media || mongoose.model('Meida', mediaSchema, 'medias')

export default MediaModel