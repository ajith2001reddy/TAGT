export default function Button({ children, className = "", ...props }) {
    return (
        <button
            className={`px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
