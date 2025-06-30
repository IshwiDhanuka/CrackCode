const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username:{
        type: String,
        required: [true, "User name is required"],
        trim: true, // Remove whitespace from beginning and end
        minlength: [6, "User name must be at least 2 characters long"],
        maxlength: [20, "User name cannot exceed 50 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true, // Convert to lowercase before saving
        trim: true,
    },

    // User's hashed password - will be encrypted before storage
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
    
    // Add timestamp fields for tracking when user was created/updated
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model("User", userSchema);


