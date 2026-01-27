import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <Navbar />

            {/* Main layout */}
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md min-h-screen p-4">
                    <h2 className="text-xl font-bold mb-6">TAGT</h2>

                    <nav className="space-y-3">
                        <a
                            href="/admin"
                            className="block px-3 py-2 rounded hover:bg-gray-200"
                        >
                            Dashboard
                        </a>

                        <a
                            href="/admin"
                            className="block px-3 py-2 rounded hover:bg-gray-200"
                        >
                            Requests
                        </a>

                        <a
                            href="/admin"
                            className="block px-3 py-2 rounded hover:bg-gray-200"
                        >
                            Residents
                        </a>
                    </nav>
                </aside>

                {/* Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
