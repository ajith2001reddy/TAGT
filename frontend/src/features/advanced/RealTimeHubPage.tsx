import React from "react";
import { PageContainer } from "./Shared";

const RealTimeHubPage = () => {
  return (
    <PageContainer title="Real-Time Operations Hub">
      <div className="space-y-6">
        <div className="p-6 bg-black text-white rounded-xl">
          <h3 className="font-semibold">Live Occupancy</h3>
          <p>92% – Updating in real-time</p>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Live Payment Activity</h3>
          <p>12 payments in last 5 minutes</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default RealTimeHubPage;