import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // --- Core Identity ---
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    
    // --- Profile Information (Optional but standard) ---
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    profilePicture: { type: String, default: "" },

    // --- Access & Authorization ---
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user' 
    },
    isActive: { 
      type: Boolean,
      default: true 
    },

    // --- Security & Auditing ---
    lastLogin: { 
      type: Date 
    },
    failedLoginAttempts: { 
      type: Number, 
      default: 0 
    },
    accountLockedUntil: { 
      type: Date 
    },

    // --- Password Recovery ---
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // --- Application Specific (Voice-to-SQL) ---
    totalQueriesExecuted: { 
      type: Number, 
      default: 0 
    }

}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;