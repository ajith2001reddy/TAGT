import express from "express";
import { getAllResidents, addResident, deleteResident } from "../controllers/residentController.js";
import auth from "../middleware/auth.js"; // Protect routes for residents
import isAdmin from "../middleware/isAdmin.js"; // Admin check for specific actions

const router = express.Router();

/**
 * @swagger
 * /api/residents:
 *   get:
 *     summary: Retrieve all residents (Admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all residents
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", auth, isAdmin, getAllResidents);

/**
 * @swagger
 * /api/residents:
 *   post:
 *     summary: Add a new resident (Admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               roomId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resident added successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", auth, isAdmin, addResident);

/**
 * @swagger
 * /api/residents/{id}:
 *   delete:
 *     summary: Delete a resident (Admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Resident ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resident deleted successfully
 *       404:
 *         description: Resident not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", auth, isAdmin, deleteResident);

export default router;
