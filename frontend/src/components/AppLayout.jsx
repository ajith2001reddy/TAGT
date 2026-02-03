import { Outlet } from "react-router-dom";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/80 to-black">
                <Outlet />
            </div>
        </div>
    );
}
