import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * @route POST /api/upload
 * @desc General file upload endpoint to Cloudinary
 * @access Public / Private (Depending on usage)
 */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // multer-storage-cloudinary automatically uploads the file and attaches the url to req.file.path
        res.json({
            url: req.file.path
        });
    } catch (err) {
        console.error("General upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;
