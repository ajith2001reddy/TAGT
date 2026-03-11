import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SECRET = process.env.ENCRYPTION_SECRET || "fallback_secret_must_be_32_chars_!";
const KEY = crypto.scryptSync(SECRET, "salt", 32);

/**
 * Encrypt text using AES-256-GCM (Authenticated Encryption)
 */
export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        const authTag = cipher.getAuthTag().toString("hex");

        // Format: iv:authTag:encrypted
        return `${iv.toString("hex")}:${authTag}:${encrypted}`;
    } catch (err) {
        console.error("[ENCRYPTION] Failed to encrypt:", err.message);
        return text;
    }
};

/**
 * Decrypt text with fallback for legacy crypto-js / plaintext
 */
export const decrypt = (cipherText) => {
    if (!cipherText || typeof cipherText !== "string") return cipherText;

    // 1. Try modern AES-GCM decryption
    if (cipherText.includes(":")) {
        try {
            const [ivHex, authTagHex, encryptedHex] = cipherText.split(":");
            const iv = Buffer.from(ivHex, "hex");
            const authTag = Buffer.from(authTagHex, "hex");
            const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encryptedHex, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch {
            // If GCM fails, maybe it's not actually GCM format
        }
    }

    // 2. Legacy Fallback: Plaintext or previous method
    // Note: We don't implement the old crypto-js here to keep dependencies clean,
    // but in a real migration we'd keep it for a while or re-save all records.
    return cipherText;
};
