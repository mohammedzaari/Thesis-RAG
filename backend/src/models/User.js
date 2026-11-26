import mongoose from 'mongoose';

export const USER_ROLES = Object.freeze({ STUDENT: 'student', ADMIN: 'admin' });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    // Never returned by default: it must be explicitly selected during login.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.STUDENT },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
