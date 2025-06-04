const { blogsModel, userModel } = require("../model/db");
const { cloudinary } = require("../lib/cloudinary");

async function blogPost(req, res) {
    try {
        const { title, body, category, imagepost } = req.body;
        const loggedInUserId = req.user._id;

        const uploadResponse = await cloudinary.uploader.upload(imagepost);

        const posts = await blogsModel.create({
            title,
            body,
            category,
            imagepost: uploadResponse.secure_url,
            author: loggedInUserId,
        });

        res.json({ success: true, message: "Blog post created successfully!", posts });
    } catch (error) {
        console.error("Error in blogPost:", error);
        res.status(500).json({ success: false, message: "Failed to create blog post." });
    }
}

async function getPosts(req, res) {
    try {
        const author = req.user._id;

        const posts = await blogsModel.find({ author });
        if (!posts || posts.length === 0) {
            return res.json({ success: false, message: "No posts found related to user." });
        }

        const user = await userModel.findById(author).select("-password -email");
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        res.json({ success: true, posts, author: user });
    } catch (error) {
        console.error("Error in getPosts:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}


async function updatePost(req, res) {
    try {
        const { blogId, title, body, imagepost, category } = req.body;
        const user = req.user._id;

        const blog = await blogsModel.findOne({ _id: blogId, author: user });
        if (!blog) {
            return res.json({ success: false, message: "Blog not found or unauthorized." });
        }

        const updateData = {};

        if (title && title !== blog.title) {
            updateData.title = title;
        }

        if (body && body !== blog.body) {
            updateData.body = body;
        }
        if (category && category !== blog.category) {
            updateData.category = category;
        }
        if (imagepost) {
            const uploadResponse = await cloudinary.uploader.upload(imagepost);
            updateData.imagepost = uploadResponse.secure_url;
        }

        if (Object.keys(updateData).length === 0) {
            return res.json({ success: false, message: "No changes detected." });
        }

        const updatedBlog = await blogsModel.findByIdAndUpdate(blogId, updateData, { new: true });

        res.json({ success: true, message: "Blog updated", updatedBlog });

    } catch (error) {
        console.error("Error in updatePost:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}


async function deletePost(req, res) {
    try {
        const userId = req.user._id;
        const { blogId } = req.body;

        const blogs = await blogsModel.findByIdAndDelete({ _id: blogId, author: userId })
        if (!blogs) {
            return res.json({ success: false, message: "For this author cannot deleet blogs" });
        }
        res.json({ success: true, message: "Post deleted" });

    } catch (error) {
        console.error("Error in delete post:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}


async function getAllPosts(req, res) {
    try {
        const blogs = await blogsModel.find({}).populate('author', '-password -email');
        res.json({ success: true, message: "Blogs fetched", blog: blogs })
    } catch (error) {
        console.error("Error in updatePosts:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}


async function searchBlogs(req, res) {
    const { q } = req.query;

    if (!q) return res.status(400).json({ error: 'Missing search query' });

    try {
        const regex = new RegExp(q, 'i');
        const matchingUsers = await userModel.find({ name: regex }).select('_id');

        const authorIds = matchingUsers.map(user => user._id);
        const results = await blogsModel.find({
            $or: [
                { title: regex },
                { body: regex },
                { author: { $in: authorIds } }
            ]
        }).populate('author');

        res.json({ success: true, count: results.length, results });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    blogPost,
    getPosts,
    updatePost,
    getAllPosts,
    deletePost,
    searchBlogs
};
