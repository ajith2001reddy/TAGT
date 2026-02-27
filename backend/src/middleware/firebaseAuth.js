import admin from "../config/firebase.js";
import User from "../models/User.js";

const firebaseAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    // Verify Firebase ID token
    const decoded = await admin.auth().verifyIdToken(token);

    // Find user in MongoDB by firebaseUid OR email
    let dbUser = await User.findOne({
      $or: [
        { firebaseUid: decoded.uid },
        { email: decoded.email?.toLowerCase() }
      ]
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please contact your administrator."
      });
    }

    // Link firebaseUid if missing (first login)
    if (!dbUser.firebaseUid) {
      dbUser.firebaseUid = decoded.uid;
      await dbUser.save();
    }

    if (!dbUser.isActive) {
      return res.status(403).json({ success: false, message: "Account inactive" });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error("firebaseAuth error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default firebaseAuth;