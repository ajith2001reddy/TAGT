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

            setProperties(res.data.data || []);

            if (res.data.data?.length > 0) {
                setProperty(res.data.data[0]);
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
        const selected = properties.find((p) => p._id === id);
        if (selected) setProperty(selected);
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