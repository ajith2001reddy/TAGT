import { cloudinary } from "../config/cloudinary.js";

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<string>} - Cloudinary URL
 */
export const uploadToCloudinary = (buffer, folder = "tagt_general") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        uploadStream.end(buffer);
    });
};
