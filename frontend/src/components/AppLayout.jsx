import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppLayout({ children }) {
    const [open, setOpen] = useState(false);

    // Lock body scroll when sidebar is open (mobile)
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <div className="flex min-h-[100dvh] bg-gray-950">
            <Sidebar open={open} onClose={() => setOpen(false)} />

            <div
                className={`flex flex-col flex-1 transition-all duration-300 ${open ? "md:ml-64" : ""
                    }`}
            >
                <Navbar onMenuClick={() => setOpen(true)} />

                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
