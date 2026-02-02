import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * AppLayout
 * - Shared layout for Admin & Resident
 * - Handles hamburger + sidebar
 */

export default function AppLayout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex bg-gray-950 min-h-screen">
            {/* Sidebar */}
            <Sidebar
                open={open}
                onClose={() => setOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                <Navbar
                    onMenuClick={() => setOpen(true)}
                />

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
