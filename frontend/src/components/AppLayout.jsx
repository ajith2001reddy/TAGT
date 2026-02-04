export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900/80 to-black">
                {children}
            </div>
        </div>
    );
}
