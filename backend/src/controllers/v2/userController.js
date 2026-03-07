import User from "../../models/User.js";
import admin from "../../config/firebase.js";
import logger from "../../utils/logger.js";

/**
 * Get the current user's profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

/**
 * Update the profile (Name and Phone)
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { name, phoneNumber } = req.body;

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            {
                ...(name ? { name } : {}),
                ...(phoneNumber !== undefined ? { phoneNumber } : {})
            },
            { new: true }
        );

        // Update Firebase if name changed
        if (name && updated.firebaseUid) {
            await admin.auth().updateUser(updated.firebaseUid, { displayName: name });
        }

        if (phoneNumber && updated.firebaseUid) {
            await admin.auth().updateUser(updated.firebaseUid, { phoneNumber });
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

/**
 * Change user's password in both MongoDB and Firebase
 */
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
        }

        const user = await User.findById(req.user._id).select("+password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Update Firebase password
        if (user.firebaseUid) {
            await admin.auth().updateUser(user.firebaseUid, { password: newPassword });
        }

        // Update local password
        user.password = newPassword;
        await user.save();

        logger.info(`Password changed for user: ${user.email}`);
        res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        next(err);
    }
};

/**
 * Admin: Update any user (Support flow)
 */
export const superAdminManageUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, role, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const updateData = {
            ...(name ? { name } : {}),
            ...(email ? { email: email.toLowerCase() } : {}),
            ...(phoneNumber !== undefined ? { phoneNumber } : {}),
            ...(role ? { role } : {}),
            ...(isActive !== undefined ? { isActive } : {})
        };

        const updated = await User.findByIdAndUpdate(id, updateData, { new: true });

        // Sync with Firebase if needed
        if (updated.firebaseUid) {
            const firebaseUpdate = {};
            if (name) firebaseUpdate.displayName = name;
            if (email) firebaseUpdate.email = email.toLowerCase();
            if (phoneNumber) firebaseUpdate.phoneNumber = phoneNumber;

            if (Object.keys(firebaseUpdate).length > 0) {
                await admin.auth().updateUser(updated.firebaseUid, firebaseUpdate);
            }
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};
