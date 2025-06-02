const { default: mongoose } = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema({
  fullname: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },
googleId: { type: String, unique: true, sparse: true },
  photo: String,
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = {
  userModel
};
