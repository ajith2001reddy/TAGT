import { PropertyProvider } from "@/context/PropertyContext";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["owner", "super_admin", "resident"]}>
            <PropertyProvider>
                <DashboardShell>{children}</DashboardShell>
            </PropertyProvider>
        </RoleGuard>
    );
}
