import { useAuth } from "@/context/AuthContext";
import { PropertySwitcher } from "./PropertySwitcher";

export function Navbar() {
    const { role } = useAuth();

    return (
        <div className="flex justify-between items-center p-4 border-b border-neutral-800">
            <h1 className="text-xl font-semibold">Dashboard</h1>

            {(role === "owner" || role === "super_admin") && (
                <PropertySwitcher />
            )}
        </div>
    );
}