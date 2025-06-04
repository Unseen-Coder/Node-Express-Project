const {userModel}=require("../model/db");
const bcrypt=require("bcrypt");
const {generateToken}=require("../lib/utils")
const {cloudinary}=require("../lib/cloudinary")
const saltrounds=10;

async function signup(req,res) {
    try {
        const {name, email, password}=req.body;

        const user=await userModel.findOne({email});
        if(user){
            res.json({ message:"User already exist."});
            return
        }
        const hashedPassword=await bcrypt.hash(password,saltrounds);

        const saveUser= await userModel.create({
            name,
            email,
            password:hashedPassword
        })

        res.json({success: true, message:"User is signed up.", saveUser});

    } catch (error) {
        console.log(error);
        res.status(404).json({success:false, message:"Internal server error.", error:error});

    }

}



async function updateProfilePic(req, res) {
  try {
    const { profilepic } = req.body; 
    const id = req.user._id;

    if (!profilepic) {
      return res.status(400).json({ error: 'No profile picture provided' });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilepic);


    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: { profilepic: uploadResponse.secure_url } },
      { new: true }
    );

    return res.json({
      success:true,
      message: 'Profile picture updated successfully',
    });

  } catch (error) {
    console.error('Error updating profile picture:', error);
    return res.status(500).json({ error: 'Server error while updating profile picture' });
  }
}


async function login(req, res){
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success:false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success:false, message: "Invalid password" });
    }

    generateToken(user._id, res);
    res.status(200).json({
      success:true,
      _id: user._id,
      name: user.name,
      email: user.email,
      profilepic: user.profilepic
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success:false, message: "Internal Server Error" });
  }
};


async function logout(req, res){
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ success:true, message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function getProfile(req,res) {
  try {
    const userId=req.user._id;
    const user=await userModel.findById({_id:userId});
    res.json({success:true, message:"User details fetched", user: user});
  } catch (error) {
    console.log("Error in get profile controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function updateProfile(req, res) {
  try {
    const userId=req.user._id;
    const {name, about}=req.body;
    if(name==="" || about===""){
      return res.json({success:false, message:"All field required."});
    }

    const users=await userModel.findByIdAndUpdate({_id:userId},{ $set: { name: name, about:about } },{ new: true });
    res.json({success:true, message:"Profile Updated"});

  } catch (error) {
    console.log("Error in get profile updation", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports={
    signup,
    updateProfilePic,
    login,
    logout,
    getProfile,
    updateProfile
}