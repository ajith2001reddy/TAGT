export default function Button({
    children,
    className = "",
    disabled = false,
    type = "button",
    variant = "primary",
    ...props
}) {
    const variants = {
        primary:
            "bg-blue-500/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
        glass:
            "bg-white/10 text-white backdrop-blur-xl border border-white/20 hover:bg-white/20",
        danger:
            "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
    };

    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                min-h-[44px] px-4 py-2
                rounded-xl
                font-medium
                transition-all duration-200
                active:scale-[0.97]
                focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-2 focus:ring-offset-black
                disabled:opacity-50 disabled:cursor-not-allowed
                backdrop-blur-xl
                ${variants[variant]}
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}
