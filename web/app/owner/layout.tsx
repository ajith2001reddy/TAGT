import { PropertyProvider } from "@/context/PropertyContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["owner"]}>
            <PropertyProvider>
                <DashboardShell>{children}</DashboardShell>
            </PropertyProvider>
        </RoleGuard>
    );
}