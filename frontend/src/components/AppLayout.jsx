import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-950">
            {/* Sidebar (overlay only) */}
            <Sidebar
                open={open}
                onClose={() => setOpen(false)}
            />

            {/* Main content */}
            <div className="flex flex-col flex-1">
                <Navbar onMenuClick={() => setOpen(true)} />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
