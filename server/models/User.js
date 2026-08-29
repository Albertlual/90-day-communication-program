const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // Minimal professional context used to personalize curriculum + Gemini
    // prompts later. Populated from a short onboarding form, not the full CV.
    professionalContext: {
      role: { type: String, default: '' },
      background: { type: String, default: '' },
      focusAreas: { type: [String], default: [] },
    },
    currentDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 90,
    },
    streak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

// Compares a plaintext candidate password against the stored hash.
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Returns the subset of fields that are safe to send to the client.
// passwordHash must never leave the server.
userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    professionalContext: this.professionalContext,
    currentDay: this.currentDay,
    streak: this.streak,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
