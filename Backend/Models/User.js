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
      }
    
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);


