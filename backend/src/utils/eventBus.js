import { EventEmitter } from "events";
import logger from "./logger.js";

/**
 * Central Event Bus for Domain Events
 * Decouples core business logic from side-effects (notifications, logs, etc.)
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.on("error", (err) => {
            logger.error("EventBus Error:", { error: err.message });
        });
    }

    /**
     * Emit an event with standard metadata
     */
    publish(event, data = {}) {
        logger.info(`[Event] Publishing: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...data
        });
        this.emit(event, data);
    }
}

const eventBus = new EventBus();

export default eventBus;
