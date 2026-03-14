import Lease from "../../models/Lease.js";
import User from "../../models/User.js";
import { buildPropertyFilter } from "../../utils/tenantScope.js";
import logger from "../../utils/logger.js";

/**
 * List leases for a property (Owner)
 */
export const listLeases = async (req, res, next) => {
    try {
        const scope = buildPropertyFilter(req.user);
        const leases = await Lease.find({ ...scope })
            .populate("residentId", "name email")
            .sort({ createdAt: -1 });

        return res.json({ success: true, data: leases });
    } catch (err) { next(err); }
};

/**
 * Upload a new lease (Owner)
 */
export const uploadLease = async (req, res, next) => {
    try {
        const { residentId, fileUrl, propertyId } = req.body;
        
        // Ensure resident belongs to this property
        const resident = await User.findOne({ _id: residentId, propertyId, role: "resident" });
        if (!resident) return res.status(404).json({ success: false, message: "Resident not found in this property" });

        const lease = await Lease.create({
            propertyId,
            residentId,
            fileUrl,
            uploadedBy: req.user._id,
            status: "pending"
        });

        logger.info(`Lease uploaded for resident ${residentId} by owner ${req.user._id}`);
        return res.status(201).json({ success: true, data: lease });
    } catch (err) { next(err); }
};

/**
 * Get lease for specifically the logged-in resident
 */
export const getMyLease = async (req, res, next) => {
    try {
        const lease = await Lease.findOne({ residentId: req.user._id, status: { $ne: "rejected" } })
            .sort({ createdAt: -1 })
            .populate("propertyId", "name address");

        if (!lease) return res.status(404).json({ success: false, message: "No active lease found" });

        return res.json({ success: true, data: lease });
    } catch (err) { next(err); }
};

/**
 * Sign lease (Resident)
 */
export const signLease = async (req, res, next) => {
    try {
        const { typedName, ipAddress, userAgent } = req.body;
        const lease = await Lease.findOne({ residentId: req.user._id, status: "pending" });

        if (!lease) return res.status(404).json({ success: false, message: "Pending lease not found" });

        lease.status = "signed";
        lease.signature = {
            residentName: req.user.name,
            acceptedAt: new Date(),
            ipAddress: ipAddress || req.ip,
            userAgent: userAgent || req.headers["user-agent"],
            typedName: typedName || req.user.name
        };

        await lease.save();
        
        logger.info(`Lease ${lease._id} signed by resident ${req.user._id}`);
        return res.json({ success: true, data: lease, message: "Lease signed successfully" });
    } catch (err) { next(err); }
};
