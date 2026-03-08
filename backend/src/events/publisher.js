import { createQueue } from "../utils/queueBuilder.js";
import logger from "../utils/logger.js";

const eventQueue = createQueue("events");

/**
 * Publishes a domain event to the persistent event queue.
 * Replaces the previous in-memory EventEmitter logic.
 * @param {string} type - The event type (e.g., 'resident.approved').
 * @param {Object} payload - The event data.
 */
export const publishEvent = async (type, payload = {}) => {
    try {
        await eventQueue.add(type, {
            ...payload,
            timestamp: new Date().toISOString()
        });

        logger.info(`[Event Enqueued] ${type}`, { type });
    } catch (err) {
        logger.error(`Failed to enqueue event: ${type}`, { error: err.message });
        throw err;
    }
};

// For backward compatibility during migration
const eventBus = {
    publish: publishEvent
};

export default eventBus;
