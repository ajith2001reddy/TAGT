import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}