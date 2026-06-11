import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    mobile: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian mobile number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function isLocked() {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function incrementLoginAttempts() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_TIME_MS) };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function resetLoginAttempts() {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 },
  });
};

userSchema.statics.findByIdentifier = function findByIdentifier(identifier) {
  const normalized = identifier.trim().toLowerCase();
  const isEmail = /^\S+@\S+\.\S+$/.test(normalized);
  const isMobile = /^[6-9]\d{9}$/.test(identifier.trim());

  if (isEmail) {
    return this.findOne({ email: normalized }).select("+password +loginAttempts +lockUntil");
  }

  if (isMobile) {
    return this.findOne({ mobile: identifier.trim() }).select("+password +loginAttempts +lockUntil");
  }

  return this.findOne({ username: normalized }).select("+password +loginAttempts +lockUntil");
};

export const User = mongoose.model("User", userSchema);
