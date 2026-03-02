import { useEffect, useState } from "react";
import {
    fetchResidentPayments,
    fetchResidentRequests,
    ResidentPayment,
    ResidentRequest,
} from "./resident.service";

export function useResidentDashboard() {
    const [payments, setPayments] = useState<ResidentPayment[]>([]);
    const [requests, setRequests] = useState<ResidentRequest[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        const [p, r] = await Promise.all([
            fetchResidentPayments(),
            fetchResidentRequests(),
        ]);

        setPayments(p);
        setRequests(r);
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, []);

    return { payments, requests, loading };
}