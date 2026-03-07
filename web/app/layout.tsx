import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  title: "TAGT - Manage Every Bed. Bill. Tenant.",
  description:
    "TAGT helps PG owners manage tenants, beds, billing, and payments in one platform.",
  keywords: [
    "PG management software",
    "hostel management",
    "tenant management",
    "property management SaaS"
  ],
  openGraph: {
    title: "TAGT",
    description: "Manage every bed, bill, and tenant.",
    url: "https://tagt.website",
    siteName: "TAGT",
    type: "website",
  },
  verification: {
    google: "A1t2IoQGTlSEoGg91k9s8xV6cMGCpVRJrjM4ig6ygJE",
  },
};

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