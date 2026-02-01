import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String, 
        required: true,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
    },
    avatar: {
        url: {
            type: String,
            trim: true
        },
        public_id: {
            type: String,
            trim: true
        },
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    phone: {
        type: String,
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, {timestamps: true});

// Password hashing handled by Firebase Authentication
// Removed bcrypt middleware - Firebase manages password encryption

const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users');

export default UserModel;
