import User from "../../models/User.js";
import admin from "../../config/firebase.js";
import logger from "../../utils/logger.js";

/**
 * Get the current user's profile
 */
export const getProfile = async (req, res, next) => {
    try {
        let query = User.findById(req.user._id).select("+password");

        // Populate unit details for residents
        if (req.user.role === "resident") {
            query = query
                .populate("propertyId", "name address city heroImage")
                .populate("roomId", "roomNumber rent")
                .populate("bedId", "bedNumber");
        }

        const user = await query;
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const userData = user.toObject();
        const responseData = {
            ...userData,
            isPasswordSet: !!userData.password
        };
        delete responseData.password;

        res.json({ success: true, data: responseData });
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
                ...(phoneNumber !== undefined ? { phoneNumber } : {}),
                updatedBy: req.user._id
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

        const hasPassword = !!user.password;

        if (hasPassword) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: "Current password is required to change your password." });
            }
            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                logger.warn(`Password change failed for user ${id}: Incorrect current password.`);
                return res.status(401).json({ success: false, message: "Incorrect current password" });
            }
        }

        // Update Firebase password (if they have a UID)
        if (user.firebaseUid) {
            try {
                await admin.auth().updateUser(user.firebaseUid, { password: newPassword });
            } catch (fbErr) {
                logger.error(`Firebase password update failed for ${user.email}`, fbErr);
                // Continue anyway if it's just a local password setup, 
                // but usually they should stay in sync
            }
        }

        // Update local password
        user.password = newPassword;
        await user.save();

        const msg = hasPassword ? "Password updated successfully" : "Password created successfully. You can now login with your email/phone and password.";
        logger.info(`${msg} for user: ${user.email || user.phoneNumber}`);
        res.json({ success: true, message: msg });
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
            ...(isActive !== undefined ? { isActive } : {}),
            updatedBy: req.user._id
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
