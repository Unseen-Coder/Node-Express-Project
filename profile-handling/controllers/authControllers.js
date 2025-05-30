const { UserModel } = require("../db/db.js");
const mongoose = require("mongoose");
const { sendOTPEmail } = require("../utils/email.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {SECRET_JWT,auth}=require("../middleware/auth.js")
const {cloudinary}=require("../utils/cloudnary.js")

const saltRounds = 10;

async function signup(req, res) {
  try {
    const { email, name, password } = req.body;
    const user = await UserModel.findOne({ email });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    if (!user) {
      await UserModel.create({
        email,
        name,
        password: hashedPassword,
        otp,
        otpExpires: expiredAt,
        isVerified: false,
      });

      await sendOTPEmail(email, otp);

      return res.json({
        success: true,
        message: "User registered. OTP sent to email.",
      });
    }

    if (!user.isVerified) {
      user.name = name;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpires = expiredAt;
      await user.save();

      await sendOTPEmail(email, otp);

      return res.json({
        success: true,
        message: "User updated. OTP re-sent to email.",
      });
    }

    return res.json({
      success: false,
      message: "User already exists and is verified. Please sign in.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.json({ success: true, message: "Account is verified" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function signin(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your OTP first.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password." });
    }
    const token = jwt.sign({ id: user._id.toString() }, SECRET_JWT);

return res.json({ success: true, message: "Login Successfully", token });

} catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}

async function profileUpdate(req,res) {

  try {
    const {name,username,address,mobnumber,socialLinks, bio} =req.body;
    const id = new mongoose.Types.ObjectId(req.id);    
    const user=await UserModel.findOne({_id:id});
    if(!user){ return res.status(403).json({success:false, message:"User not found"})};

await UserModel.updateOne(
  { _id: id }, 
  {
    $set: {
      name,
      username,
      address,
      mobnumber,
      bio,
      socialLinks
    }
  }
);

    res.status(200).json({success:true, message:"Profile Updated"})
  

} catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });

}

}



async function getProfile(req,res) {
      try {
        const id = new mongoose.Types.ObjectId(req.id);   
        const user=await UserModel.findOne({_id:id});
  
        if(user){
          return res.status(200).json({success:true, message: user})
        }
      } catch (error) {
    console.error("Error on profile fetching:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });

}

}


async function updateProfilePic(req, res) {
  try {
    const { profilepic } = req.body; 
    const id = new mongoose.Types.ObjectId(req.id);

    if (!profilepic) {
      return res.status(400).json({ error: 'No profile picture provided' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilepic);


    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: { profilepic: uploadResponse.secure_url } },
      { new: true }
    );

    return res.json({
      success:true,
      message: 'Profile picture updated successfully',
      updatedUser,
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Server error while updating profile picture' });
  }
}

async function deleteProfile(req, res) {
  try {
    const id = new mongoose.Types.ObjectId(req.id);
    await UserModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Profile is deleted. You will be logged out within 5 seconds."
    });
  } catch (error) {
    console.error("Error on profile deleting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


async function getAllUser(req, res) {
  try {

    const users = await UserModel.find(
      { isVerified: true },
      {
        email: 1,
        name: 1,
        profilepic:1,
        username: 1,
        bio: 1,
        "socialLinks": 1,
        _id: 0
      }
    );

    res.json({success: true,message: "Data fetched",users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({success: false,message: "Internal server error",error: error.message});
  }
}




module.exports = {
  signup,
  verifyOtp,
  signin,
  profileUpdate,
  getProfile,
  updateProfilePic,
  deleteProfile,
  getAllUser
};
