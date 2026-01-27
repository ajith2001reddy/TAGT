import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function AdminResidents() {
    const [residents, setResidents] = useState([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        room: "",
        rent: ""
    });

    const token = localStorage.getItem("token");

    /* =========================
       FETCH RESIDENTS
    ========================= */
    cconst fetchResidents = useCallback(async () => {
        try {
            const res = await axios.get("/admin/residents", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResidents(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setResidents([]); // prevent crash
        }
    }, [token]);


    /* =========================
       ADD RESIDENT
    ========================= */
    const addResident = async () => {
        await axios.post("/admin/residents", form, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setForm({
            name: "",
            email: "",
            password: "",
            room: "",
            rent: ""
        });

        fetchResidents();
    };

    /* =========================
       ON LOAD
    ========================= */
    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Residents</h2>

            {/* ADD RESIDENT FORM */}
            <div className="grid grid-cols-5 gap-2 mb-6">
                {["name", "email", "password", "room", "rent"].map(field => (
                    <input
                        key={field}
                        placeholder={field}
                        type={field === "password" ? "password" : "text"}
                        value={form[field]}
                        onChange={e =>
                            setForm({ ...form, [field]: e.target.value })
                        }
                        className="border p-2 rounded"
                    />
                ))}

                <button
                    onClick={addResident}
                    className="bg-blue-600 text-white px-4 py-2 rounded col-span-5"
                >
                    Add Resident
                </button>
            </div>

            {/* RESIDENT TABLE */}
            <table className="w-full border">
                <thead>
                    <tr className="border-b">
                        <th>Name</th>
                        <th>Email</th>
                        <th>Room</th>
                        <th>Rent</th>
                    </tr>
                </thead>

                <tbody>
                    {Array.isArray(residents) && residents.map(r => (
                        <tr key={r._id} className="border-b text-center">
                            <td>{r.userId?.name}</td>
                            <td>{r.userId?.email}</td>
                            <td>{r.room}</td>
                            <td>${r.rent}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
