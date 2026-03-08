import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "tagt_general",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"]
    },
});

const upload = multer({ storage: storage });

export default upload;
