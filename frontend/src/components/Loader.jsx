export default function Loader({ label = "Loading…" }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
                <div className="h-10 w-10 rounded-full border border-white/20 backdrop-blur-xl" />
                <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-blue-400/80 border-t-transparent shadow-blue-400/40" />
            </div>
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}
