export default function Card({ children, className = "" }) {
    return (
        <div
            className={`
                w-full
                max-w-[420px]
                mx-auto
                rounded-xl
                bg-black/60 backdrop-blur-md
                border border-white/10
                shadow-xl
                p-4 sm:p-6
                ${className}
            `}
        >
            {children}
        </div>
    );
}
