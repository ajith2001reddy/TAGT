"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface Property {
    _id: string;
    name: string;
    address: string;
    city: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    monthlyRevenue?: number;
}

export interface PropertyContextType {
    property: Property | null;
    properties: Property[];
    loading: boolean;
    refreshProperty: () => Promise<void>;
    setCurrentProperty: (id: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(
    undefined
);

export function PropertyProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [property, setProperty] = useState<Property | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    async function fetchProperties() {
        try {
            setLoading(true);

            const res = await api.get("/owner/properties");
            const fetched = res.data.data || [];
            setProperties(fetched);

            // 🛠️ Persistence: Load last selected from localStorage
            const savedId = localStorage.getItem("selected_property_id");
            if (savedId) {
                const found = fetched.find((p: any) => p._id === savedId);
                if (found) {
                    setProperty(found);
                    setLoading(false);
                    return;
                }
            }

            // Default to first property if nothing saved
            if (fetched.length > 0) {
                setProperty(fetched[0]);
            }
        } catch (err) {
            console.error("Failed to fetch properties");
        } finally {
            setLoading(false);
        }
    }

    async function refreshProperty() {
        await fetchProperties();
    }

    function setCurrentProperty(id: string) {
        if (!id) {
            setProperty(null); // "All Properties" selected
            localStorage.removeItem("selected_property_id");
            return;
        }
        const selected = properties.find((p) => p._id === id);
        if (selected) {
            setProperty(selected);
            localStorage.setItem("selected_property_id", id);
        }
    }

    useEffect(() => {
        if (role === "owner" || role === "super_admin") {
            fetchProperties();
        } else {
            setLoading(false);
        }
    }, [role]);

    return (
        <PropertyContext.Provider
            value={{
                property,
                properties,
                loading,
                refreshProperty,
                setCurrentProperty,
            }}
        >
            {children}
        </PropertyContext.Provider>
    );
}

export function useProperty() {
    const context = useContext(PropertyContext);

    if (!context) {
        throw new Error(
            "useProperty must be used inside PropertyProvider"
        );
    }

    return context;
}