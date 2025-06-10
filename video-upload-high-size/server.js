const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { GridFSBucket } = require("mongodb");

const app = express();
const mongoURI = "mongodb://localhost:27017/videos";
mongoose.connect(mongoURI);

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

app.use(express.static("public"));
app.use(express.json());

const movieSchema = new mongoose.Schema({
  videoFilename: String,
  createdAt: { type: Date, default: Date.now },
});

const Movie = mongoose.model("Movie", movieSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post(
  "/api/upload",
  upload.fields([{ name: "video", maxCount: 1 }]),
  async (req, res) => {
    try {
      const videoFile = req.files["video"][0];
      const move = new Movie({
        videoFilename: videoFile.filename,
      });
      await move.save();
      res.json({
        success: true,
        message: "Uploaded",
        filename: videoFile.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, error: "Upload failed" });
    }
  }
);

app.get("/api/videos/:filename", async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    res.set({ "Content-Type": "video/mp4", "Accept-Ranges": "bytes" });
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ success: false, error: "Video streaming failed" });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on port: http://localhost:${3000}`);
});
