import { Router } from "express";
import auth from "../middleware/auth.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
    createProperty,
    createOwner,
    assignOwnerToProperty,
    listOwners,
    removePropertyFromOwner,
    deleteOwner,
    deleteResident,
    deleteProperty,
    approveVerification,
    rejectVerification
} from "../controllers/adminController.js";

const router = Router();

// Only super_admin allowed
router.get("/owners", auth, isAdmin, listOwners);
router.post("/properties", auth, isAdmin, createProperty);
router.post("/owners", auth, isAdmin, createOwner);
router.post("/properties/:id/assign-owner", auth, isAdmin, assignOwnerToProperty);
router.delete("/owners/:ownerId/properties/:propertyId", auth, isAdmin, removePropertyFromOwner);
router.delete("/owners/:id", auth, isAdmin, deleteOwner);
router.delete("/residents/:id", auth, isAdmin, deleteResident);
router.delete("/properties/:id", auth, isAdmin, deleteProperty);

// Verification approval
router.post("/approve/:id", auth, isAdmin, approveVerification);
router.post("/reject/:id", auth, isAdmin, rejectVerification);

export default router;