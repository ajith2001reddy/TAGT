import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { PostHogProvider } from "@/components/PostHogProvider";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  metadataBase: new URL("https://www.tagt.website"),
  title: "TAGT - Manage Every Bed. Bill. Tenant.",
  description:
    "TAGT helps PG owners manage tenants, beds, billing, and payments in one platform.",
  keywords: [
    "PG management software",
    "hostel management",
    "tenant management",
    "property management SaaS"
  ],
  alternates: {
    canonical: "https://www.tagt.website",
  },
  openGraph: {
    title: "TAGT",
    description: "Manage every bed, bill, and tenant.",
    url: "https://www.tagt.website",
    siteName: "TAGT",
    type: "website",
  },
  verification: {
    google: "A1t2IoQGTlSEoGg91k9s8xV6cMGCpVRJrjM4ig6ygJE",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
            <PostHogProvider>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </PostHogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}