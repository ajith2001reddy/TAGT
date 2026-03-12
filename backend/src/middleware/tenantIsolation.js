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
    // Determine tenant context: role, id, and propertyIds.
    let context = null;
    if (req.user) {
        context = {
            id: String(req.user._id),
            role: req.user.role,
            propertyIds: (req.user.propertyIds || []).map(id => String(id)),
            propertyId: req.user.propertyId ? String(req.user.propertyId) : null,
            ownerId: req.user.ownerId ? String(req.user.ownerId) : null
        };

        if (req.user.role === "super_admin") {
            context.role = "SUPER_ADMIN_BYPASS";
        }
    }

    // Run the rest of the request within this async context
    tenantContext.run(context, () => {
        next();
    });
};

/**
 * Mongoose Plugin to automatically append the `ownerId` to queries.
 */
export const tenantIsolationPlugin = function (schema) {
    // Only apply to schemas that actually have a tenant-scoping field
    const paths = schema.paths;
    if (!paths.ownerId && !paths.propertyId && !paths.owner) {
        return;
    }

    const enforceTenantFilter = function (next) {
        const context = tenantContext.getStore();

        // 1. If there's no active context, 
        // 2. OR If it's a super admin bypassing isolation
        if (!context || context.role === "SUPER_ADMIN_BYPASS") {
            return next();
        }

        // 3. Force the query to be scoped to the active tenant
        const conditions = {};

        if (context.role === "owner") {
            // For Models with propertyId (Rooms, Residents, Beds, Payments)
            if (schema.paths.propertyId) {
                conditions.propertyId = { $in: context.propertyIds };
            }
            // For Models with owner/ownerId (Property, Subscription, User)
            else if (schema.paths.owner || schema.paths.ownerId) {
                const field = schema.paths.ownerId ? "ownerId" : "owner";
                
                // SECURITY: If it's the User model, an owner can see residents where ownerId = them
                // AND they must be able to see THEMSELVES (where _id = them)
                if (schema.tree.role) {
                    this.where({ $or: [{ [field]: context.id }, { _id: context.id }] });
                    return next();
                }

                conditions[field] = context.id;
            }
        }
        else if (context.role === "resident") {
            // Residents are scoped to their assigned property OR their owner
            if (schema.paths.propertyId && context.propertyId) {
                conditions.propertyId = context.propertyId;
            } else if (schema.paths.ownerId && context.ownerId) {
                conditions.ownerId = context.ownerId;
            } else if (schema.paths.owner && context.ownerId) {
                conditions.owner = context.ownerId;
            }

            // SECURITY: If it's the User model, allow them to see THEIR OWN profile even if ownerId isn't set yet
            if (schema.tree.role && conditions.propertyId === undefined && conditions.ownerId === undefined && conditions.owner === undefined) {
                // Fallback to allow 'me' queries to work while migration is pending
                this.where({ _id: context.id });
            }
        }

        if (Object.keys(conditions).length > 0) {
            this.where(conditions);
        }

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
