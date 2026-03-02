import { Router } from "express";
import auth from "../middleware/auth.js";
import isAdmin from "../middleware/isAdmin.js";
import {
    createProperty,
    createOwner,
    assignOwnerToProperty
} from "../controllers/adminController.js";

const router = Router();

// Only super_admin allowed
router.post("/properties", auth, isAdmin, createProperty);
router.post("/owners", auth, isAdmin, createOwner);
router.post("/properties/:id/assign-owner", auth, isAdmin, assignOwnerToProperty);

export default router;