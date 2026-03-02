import admin from "../config/firebase.js";
import User from "../models/User.js";

const firebaseAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    // 1️⃣ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // 2️⃣ Find user in DB
    const dbUser = await User.findOne({
      $or: [
        { firebaseUid: decoded.uid },
        { email: decoded.email?.toLowerCase() }
      ]
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User not registered in system"
      });
    }

    if (!dbUser.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account inactive"
      });
    }

    // 3️⃣ Link firebaseUid if missing
    if (!dbUser.firebaseUid) {
      dbUser.firebaseUid = decoded.uid;
      await dbUser.save();
    }

    // 4️⃣ Attach user
    req.user = dbUser;

    next();
  } catch (error) {
    console.error("firebaseAuth error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default firebaseAuth;