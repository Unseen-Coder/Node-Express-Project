const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const user = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, default: "", unique: true },
  password: { type: String, required: true },
  profilepic: { type: String, default: "" },
  address: { type: String, default: "" },
  mobnumber: { type: String, default: "" },
  bio: { type: String, default: "" },

  status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
  socialLinks: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" }
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date }
}, {
  timestamps: { createdAt: true, updatedAt: false } 
});


const UserModel = mongoose.model("users", user);

module.exports = {
  UserModel,
};
