const express = require("express");
const jwt = require("jsonwebtoken");
const { signup, verifyOtp, signin, profileUpdate, getProfile, updateProfilePic,deleteProfile,getAllUser } = require("./controllers/authControllers.js");
const { auth } = require("./middleware/auth.js");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  "DB_URL"
);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "dashboard.html"));
// });
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/verify-session", auth, (req, res) => {
  const decoded = req.id;
  return res.json({ message: "Token verified", user: decoded })
});

app.post("/signup", signup);
app.post("/signin", signin);
app.post("/verify", verifyOtp);
app.post("/update-profile",auth, profileUpdate);
app.get("/get-profile",auth, getProfile);
app.post("/profile-pic",auth, updateProfilePic);
app.delete("/delte-profile",auth, deleteProfile);
app.get("/get-users",auth, getAllUser);

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
