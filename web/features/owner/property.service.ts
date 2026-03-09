import { api } from "@/lib/api";

export interface Property {
    _id?: string;
    name: string;
    address: string;
    rooms: number;
    beds: number;
}

export async function createProperty(property: Property): Promise<Property> {
    const { data } = await api.post("/v2/provider/properties", property);
    return data.data;
}

export async function fetchMyProperties(): Promise<Property[]> {
    const { data } = await api.get("/v2/provider/properties");
    return data.data || [];
}
