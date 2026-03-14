// web/app/provider/layout.tsx
// FIX: RoleGuard was allowing ["super_admin", "resident"] which is wrong —
// residents should never access the provider (super admin) dashboard.
// Fixed to ["super_admin"] only.

import { RoleGuard } from "@/components/auth/RoleGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PropertyProvider } from "@/context/PropertyContext";

export default function ProviderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RoleGuard allowed={["super_admin"]}>
            <PropertyProvider>
                <DashboardShell>
                    {children}
                </DashboardShell>
            </PropertyProvider>
        </RoleGuard>
    );
}