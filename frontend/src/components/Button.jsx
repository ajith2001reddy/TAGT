export default function Button({
    children,
    className = "",
    disabled = false,
    type = "button",
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`
                min-h-[44px] px-4 py-2
                rounded-lg
                bg-blue-600 text-white
                font-medium
                transition-all duration-200
                active:scale-[0.98]
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-blue-700
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}
