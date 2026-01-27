import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                style: {
                    borderRadius: "10px",
                    background: "#1e293b",
                    color: "#fff"
                }
            }}
        />
    );
}
