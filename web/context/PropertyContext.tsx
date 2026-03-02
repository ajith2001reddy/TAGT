"use client";

import { createContext, useContext, useState } from "react";

type PropertyContextType = {
    selectedProperty: string | null;
    setSelectedProperty: (id: string | null) => void;
};

const PropertyContext = createContext<PropertyContextType | null>(null);

export function PropertyProvider({ children }: { children: React.ReactNode }) {
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

    return (
        <PropertyContext.Provider value={{ selectedProperty, setSelectedProperty }}>
            {children}
        </PropertyContext.Provider>
    );
}

export function useProperty() {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error("useProperty must be used inside PropertyProvider");
    }
    return context;
}