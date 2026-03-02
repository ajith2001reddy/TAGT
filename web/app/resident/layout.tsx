import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PropertyProvider } from "@/context/PropertyContext";

export default function ResidentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["resident"]}>
            <PropertyProvider>
                <DashboardShell>{children}</DashboardShell>
            </PropertyProvider>
        </RoleGuard>
    );
}