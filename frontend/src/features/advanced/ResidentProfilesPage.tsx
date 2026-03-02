import React from "react";
import { PageContainer } from "./Shared";

const ResidentProfilesPage = () => {
  return (
    <PageContainer title="Resident Intelligence Profiles">
      <div className="space-y-6">
        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Behavior Insights</h3>
          <p>Payment consistency score: 98%</p>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Churn Probability</h3>
          <p>Low risk</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default ResidentProfilesPage;