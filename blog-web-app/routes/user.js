const {Router}=require("express");
const {signup, login, updateProfilePic, logout, getProfile, updateProfile}=require("../controllers/userAuth")
const {protectRoute}=require("../middleware/middleAuth")

const userRoutes=Router();

userRoutes.post("/signup",signup)
userRoutes.post("/signin",login)
userRoutes.post("/logout", logout)
userRoutes.get("/get-user",protectRoute,getProfile)
userRoutes.put("/profilepic",protectRoute, updateProfilePic)
userRoutes.put("/profileupdate",protectRoute, updateProfile)

module.exports={
    userRoutes
}