import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["super_admin"]}>
            <DashboardShell>{children}</DashboardShell>
        </RoleGuard>
    );
}