const {Router}=require("express");
const {blogPost, getPosts, updatePost, getAllPosts, deletePost, searchBlogs}=require("../controllers/blogAuth")
const {protectRoute}=require("../middleware/middleAuth");


const blogsRoutes=Router();


blogsRoutes.post("/newpost",protectRoute, blogPost)
blogsRoutes.get("/getpost",protectRoute, getPosts)
blogsRoutes.put("/updatepost",protectRoute, updatePost)
blogsRoutes.get("/allblogs",protectRoute, getAllPosts)
blogsRoutes.delete("/deleteblogs", protectRoute ,deletePost)
blogsRoutes.get('/search',protectRoute, searchBlogs);


module.exports={
    blogsRoutes
}