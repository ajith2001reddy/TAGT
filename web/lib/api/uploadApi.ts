import { api } from "../api";

/**
 * Uploads a single file to the generic Cloudinary backend
 */
export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return res.data.url;
};

/**
 * Uploads multiple verification documents sequentially/concurrently 
 * or posts them all directly to the verify endpoint
 */
export const submitVerificationDocuments = async (files: {
    selfie: File;
    idFront: File;
    idBack: File;
    propertyDoc?: File;
}) => {
    const formData = new FormData();
    formData.append("selfie", files.selfie);
    formData.append("idFront", files.idFront);
    formData.append("idBack", files.idBack);

    if (files.propertyDoc) {
        formData.append("propertyDoc", files.propertyDoc);
    }

    const res = await api.post("/verify/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return res.data;
};
