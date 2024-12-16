const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    role: { 
        type: String, 
        enum:['student', 'professor'], 
        required: true 
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Added index for faster queries
userSchema.index({ email: 1 });

// Pre-save middleware to validate email format
userSchema.pre('save', function(next) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
        next(new Error('Invalid email format'));
    }
    next();
});

module.exports = mongoose.model('User', userSchema);