import { useEffect, useState } from "react";
import { fetchPayments, Payment } from "./payments.service";

export function usePayments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        const data = await fetchPayments();
        setPayments(data);
    }

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, []);

    return { payments, loading, reload: load };
}