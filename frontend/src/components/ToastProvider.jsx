import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    borderRadius: "12px",
                    background: "#111827", // Dark background with slight contrast
                    color: "#ffffff",
                    fontSize: "14px",
                    padding: "8px 12px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.5)"
                },
                success: {
                    style: {
                        background: "#10b981", // Green
                        color: "#ffffff"
                    }
                },
                error: {
                    style: {
                        background: "#dc2626", // Red
                        color: "#ffffff"
                    }
                },
                loading: {
                    style: {
                        background: "#2563eb", // Blue
                        color: "#ffffff"
                    }
                }
            }}
        />
    );
}
