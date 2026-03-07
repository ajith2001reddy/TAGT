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
    const { id } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (req.user.role === "super_admin") {
        logger.warn(`Attempted password change by super_admin user ${id} blocked.`);
        return res.status(403).json({
            success: false,
            message: "Super Administrators cannot change passwords through this interface for security reasons."
        });
    }

    try {
        if (!currentPassword || !newPassword || newPassword.length < 6) {
            logger.warn(`Password change failed for user ${id}: Invalid input. currentPassword: ${!!currentPassword}, newPassword: ${!!newPassword}, newPasswordLength: ${newPassword ? newPassword.length : 'N/A'}`);
            return res.status(400).json({ success: false, message: "Current password and new password are required, and new password must be at least 6 characters." });
        }

        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            logger.error(`Password change failed for user ${id}: User not found.`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            logger.warn(`Password change failed for user ${id}: Incorrect current password.`);
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

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
