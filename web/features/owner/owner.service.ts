import api from "@/lib/api";
import { useProperty } from "@/context/PropertyContext";

export type OwnerStats = {
    totalResidents: number;
    totalRooms: number;
    occupancyRate: number;
    pendingPayments: number;
    overduePayments: number;
    monthlyRevenue: number;
};

export async function fetchOwnerStats(selectedProperty: string | null) {
    const query = selectedProperty
        ? `?propertyId=${selectedProperty}`
        : "";

    const { data } = await api.get(`/owner/stats${query}`);
    return data.stats;
}