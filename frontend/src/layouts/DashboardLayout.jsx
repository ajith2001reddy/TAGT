import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
    const role = localStorage.getItem("role");

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-md min-h-screen p-4">
                    <h2 className="text-xl font-bold mb-6">TAGT</h2>

                    <nav className="space-y-3">
                        {/* Common */}
                        <a
                            href={role === "admin" ? "/admin" : "/resident"}
                            className="block px-3 py-2 rounded hover:bg-gray-200"
                        >
                            Dashboard
                        </a>

                        {/* Admin only */}
                        {role === "admin" && (
                            <>
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
                            </>
                        )}

                        {/* Resident only */}
                        {role === "resident" && (
                            <a
                                href="/resident"
                                className="block px-3 py-2 rounded hover:bg-gray-200"
                            >
                                My Requests
                            </a>
                        )}
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
