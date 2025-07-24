const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required: [true, "User name is required"],
        trim: true, 
        minlength: [2, "User name must be at least 2 characters long"],
        maxlength: [20, "User name cannot exceed 50 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, 
        trim: true,
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },

    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin']
      },
    // Additions for profile features
    solvedProblems: {
        type: [String],
        default: []
    },
    problemsSolved: {
        type: Number,
        default: 0
    },
    loginHistory: {
        type: [Date],
        default: []
    },
    streak: {
        type: Number,
        default: 0
    },
    badges: [
        {
            name: String,
            icon: String,
            achievedAt: Date
        }
    ],
    points: {
        type: Number,
        default: 0
    }
    
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);


