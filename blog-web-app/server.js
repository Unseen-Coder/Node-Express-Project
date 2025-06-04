const express =require("express");
const dotenv=require("dotenv");
const {blogsRoutes}=require("./routes/blogs")
const cookieParser = require('cookie-parser');
const {userRoutes}=require("./routes/user");
const mongoose = require("mongoose");
const path=require("path")
dotenv.config();
const app=express();
app.use(express.json())
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)

app.use("/api/blogs",blogsRoutes);
app.use("/api/users",userRoutes);
app.use(express.static(path.join(__dirname, 'public')));


app.listen(process.env.PORT,()=>{
    console.log(`server is running at ${process.env.PORT}=> http://localhost:${process.env.PORT}`);
})