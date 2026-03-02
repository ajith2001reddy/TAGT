import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["super_admin", "provider", "resident"]}>
            <DashboardShell>
                {children}
            </DashboardShell>
        </RoleGuard>
    );
}