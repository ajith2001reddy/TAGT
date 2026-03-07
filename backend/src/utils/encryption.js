import CryptoJS from "crypto-js";

const SECRET = process.env.ENCRYPTION_SECRET || "fallback_secret_for_dev_only";

export const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, SECRET).toString();
};

export const decrypt = (cipherText) => {
    if (!cipherText) return cipherText;
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || cipherText;
    } catch {
        return cipherText; // Fallback so existing plaintext records don't break
    }
};
