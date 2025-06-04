const { default: mongoose } = require("mongoose");
const { Schema } = require("mongoose");

const userSchema = new Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilepic: { type: String },
    about: {type: String, default:"Bloger"}
});

const blogsSchema = new Schema({
    title: { type: String },
    body: { type: String},
    category: { type: String},
    imagepost: String,
    author: { type: Schema.Types.ObjectId, ref: "user" }
},
    {
        timestamps: true
    }
);

const userModel = mongoose.model("user", userSchema);
const blogsModel = mongoose.model("blogs", blogsSchema);

module.exports = {
    userModel,
    blogsModel
};
