import BaseService from "./BaseService.js";
import Property from "../models/Property.js";
import Room from "../models/Room.js";
import Bed from "../models/Bed.js";
import logger from "../utils/logger.js";

class PropertyService extends BaseService {
    constructor() {
        super(Property);
    }

    /**
     * Get rooms for a property with occupancy stats.
     * @param {string} propertyId 
     * @returns {Promise<Array>}
     */
    async getRooms(propertyId) {
        return Room.find({ propertyId }).lean();
    }

    /**
     * Create a room in a property.
     * @param {Object} roomData 
     * @returns {Promise<Object>}
     */
    async createRoom(roomData) {
        const room = await Room.create(roomData);
        // Additional logic like initializing beds could go here
        return room;
    }

    /**
     * Get beds for a room or property.
     * @param {Object} filter 
     * @returns {Promise<Array>}
     */
    async getBeds(filter) {
        return Bed.find(filter).populate("residentId", "name email").lean();
    }

    /**
     * Assign a resident to a bed.
     * @param {string} bedId 
     * @param {string} residentId 
     * @returns {Promise<Object>}
     */
    async assignBed(bedId, residentId) {
        const bed = await Bed.findById(bedId);
        if (!bed) throw new Error("Bed not found");
        if (bed.status !== "available") throw new Error("Bed is not available");

        bed.residentId = residentId;
        bed.status = "occupied";
        await bed.save();

        return bed;
    }

    /**
     * Update property status (e.g., active, suspended).
     * @param {string} propertyId 
     * @param {string} status 
     * @returns {Promise<Object>}
     */
    async updateStatus(propertyId, status) {
        const property = await this.model.findById(propertyId);
        if (!property) throw new Error("Property not found");

        property.status = status;
        await property.save();

        logger.info(`Property ${propertyId} status updated to ${status}`);
        return property;
    }

    /**
     * Generate a unique join code for a property.
     * Format: NAME-CITY-XXXX (XXXX is random hex)
     * @param {string} name 
     * @param {string} city 
     * @returns {string}
     */
    generateJoinCode(name, city) {
        const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
        const cleanCity = city.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 3);
        const random = Math.floor(1000 + Math.random() * 9000);
        return `${cleanName}-${cleanCity}-${random}`;
    }

    /**
     * Placeholder for updating property stats (room counts, bed counts etc)
     * @param {string} propertyId 
     */
    async updatePropertyStats(propertyId) {
        // This would traditionally update cached counts on the property document
        // In current implementation, we fetch these dynamically in listProperties
        logger.debug(`Property stats sync requested for ${propertyId}`);
    }
}

export default new PropertyService();
