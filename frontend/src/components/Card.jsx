export default function Card({ children, className = "", variant = "glass" }) {
    const variants = {
        glass:
            "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/40",
        solid:
            "bg-gray-900 border border-white/10 shadow-xl",
        subtle:
            "bg-white/5 backdrop-blur-xl border border-white/10"
    };

    return (
        <div
            className={`
                w-full
                max-w-[420px]
                mx-auto
                rounded-2xl
                p-5 sm:p-6
                transition-all duration-300
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
