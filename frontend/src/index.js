import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

// Ensure the root element exists before rendering
const rootElement = document.getElementById("root");

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <AuthProvider>
            <App />
        </AuthProvider>
    );
} else {
    console.error("Root element not found. Make sure there's a <div id='root'></div> in your HTML.");
}
