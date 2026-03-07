/**
 * Multi-Tenant Database Isolation Plugin for Mongoose.
 * 
 * Enforces automatic tenant (ownerId) scoping on all read/update/delete 
 * queries to prevent cross-tenant data leakage.
 */

import { AsyncLocalStorage } from "async_hooks";
export const tenantContext = new AsyncLocalStorage();

/**
 * Express middleware to initialize the tenant context for every request.
 * Extracts the user ID (ownerId) from the authenticated request.
 */
export const enforceTenantIsolation = (req, res, next) => {
    // Determine tenant ID: owner gets isolated to their own ID.
    // If it's a super_admin, they bypass isolation.
    // Residents might have their own scoping logic depending on the route, 
    // but for core SaaS data (Rooms, Payments, Residents), isolation hinges on ownerId.
    let tenantId = null;

    if (req.user) {
        if (req.user.role === "super_admin") {
            // Bypass isolation for super admin.
            tenantId = "SUPER_ADMIN_BYPASS";
        } else if (req.user.role === "owner") {
            tenantId = req.user.uid;
        } else if (req.user.role === "resident" && req.user.ownerId) {
            // Residents operate within their owner's tenant space
            tenantId = req.user.ownerId;
        }
    }

    // Run the rest of the request within this async context
    tenantContext.run(tenantId, () => {
        next();
    });
};

/**
 * Mongoose Plugin to automatically append the `ownerId` to queries.
 */
export const tenantIsolationPlugin = function (schema) {
    // Only apply to schemas that actually have an ownerId field
    if (!schema.paths.ownerId) {
        return;
    }

    const enforceTenantFilter = function (next) {
        const tenantId = tenantContext.getStore();

        // 1. If there's no active context (e.g., background cron job not in an HTTP request), OR
        // 2. If it's a super admin bypassing isolation
        if (!tenantId || tenantId === "SUPER_ADMIN_BYPASS") {
            return next();
        }

        // 3. Force the query to be scoped to the active tenant
        this.where({ ownerId: tenantId });
        next();
    };

    // Apply the filter to all find-like operations
    schema.pre("find", enforceTenantFilter);
    schema.pre("findOne", enforceTenantFilter);
    schema.pre("findOneAndUpdate", enforceTenantFilter);
    schema.pre("findOneAndDelete", enforceTenantFilter);
    schema.pre("countDocuments", enforceTenantFilter);
    schema.pre("updateMany", enforceTenantFilter);
    schema.pre("deleteMany", enforceTenantFilter);
};
