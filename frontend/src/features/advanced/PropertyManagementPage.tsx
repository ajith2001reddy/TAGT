import React from "react";
import { PageContainer } from "./Shared";

const PropertyManagementPage = () => {
  return (
    <PageContainer title="Property Management Control Center">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold">Multi-Property Dashboard</h3>
          <p>Total Properties: 24</p>
          <p>Active Residents: 1,284</p>
        </div>

        <div className="p-6 bg-green-50 rounded-xl">
          <h3 className="font-semibold">Smart Allocation Engine</h3>
          <p>Auto-assign rooms based on availability and preferences.</p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl">
          <h3 className="font-semibold">Compliance & Audit Logs</h3>
          <p>Track activity logs and regulatory compliance.</p>
        </div>

        <div className="p-6 bg-yellow-50 rounded-xl">
          <h3 className="font-semibold">Smart Lease Contracts</h3>
          <p>Digital signature & automated renewals.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default PropertyManagementPage;