import { Router } from "express";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = Router();

router.get("/me", firebaseAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      propertyId: req.user.propertyId ?? null,
      roomId: req.user.roomId ?? null,
    },
    message: "Authenticated user profile fetched",
  });
});

export default router;
