import express from "express";
import upload from "../middleware/upload.js";
import { uploadToCloudinary } from "../utils/cloudinaryHelper.js";

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

        // Use folder from request body, default to tagt_general
        const folder = req.body.folder || "tagt_general";
        const url = await uploadToCloudinary(req.file.buffer, folder);

        res.json({
            url: url
        });
    } catch (err) {
        console.error("General upload error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});

export default router;
