/**
 * Base Service class providing common CRUD operations.
 * All domain services should extend this class.
 */
export default class BaseService {
    constructor(model) {
        this.model = model;
    }

    /**
     * Create a new document.
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    async create(data) {
        return this.model.create(data);
    }

    /**
     * Find a document by ID.
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    async findById(id) {
        return this.model.findById(id);
    }

    /**
     * Find documents with filters.
     * @param {Object} filter 
     * @returns {Promise<Array>}
     */
    async find(filter = {}) {
        return this.model.find(filter);
    }

    /**
     * Update a document by ID.
     * @param {string} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    async update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    /**
     * Delete a document by ID.
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    async delete(id) {
        return this.model.findByIdAndDelete(id);
    }
}
