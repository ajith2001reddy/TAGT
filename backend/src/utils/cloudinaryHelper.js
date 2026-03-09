import { cloudinary } from "../config/cloudinary.js";
import { Readable } from "stream";

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

        Readable.from([buffer]).pipe(uploadStream);
    });
};

/**
 * Deletes a file from Cloudinary by its secure URL
 * @param {string} fileUrl - Secure URL of the file to delete
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (fileUrl) => {
    if (!fileUrl) return null;
    try {
        // Extract public ID from URL
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
        const parts = fileUrl.split("/");
        const fileName = parts.pop().split(".")[0];
        const folder = parts.pop();
        const publicId = `${folder}/${fileName}`;

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        return null; // Don't crash if delete fails
    }
};

/**
 * Deletes all files in a folder and then the folder itself
 * @param {string} folderPath - Path of the folder to delete
 * @returns {Promise<any>}
 */
export const deleteCloudinaryFolder = async (folderPath) => {
    if (!folderPath) return null;
    try {
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        const result = await cloudinary.api.delete_folder(folderPath);
        return result;
    } catch (error) {
        console.error(`Cloudinary folder delete error (${folderPath}):`, error);
        return null;
    }
};
