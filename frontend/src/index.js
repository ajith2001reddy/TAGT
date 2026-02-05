import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
    throw new Error(
        "Root element not found. Make sure there's a <div id='root'></div> in your HTML."
    );
}

ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
