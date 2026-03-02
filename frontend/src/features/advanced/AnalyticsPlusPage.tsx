// advanced/AnalyticsPlusPage.tsx

import React from "react";
import { PageContainer, StatCard } from "./Shared";

const AnalyticsPlusPage = () => {
  return (
    <PageContainer title="AI Analytics Plus">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Revenue Forecast (30 Days)" value="$84,500" />
        <StatCard title="Churn Risk Score" value="12%" />
        <StatCard title="Occupancy Prediction" value="94%" />
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold mb-2">AI Revenue Optimizer</h3>
          <p className="text-gray-600">
            Dynamic pricing suggestions based on occupancy, seasonality,
            and demand forecasting.
          </p>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold mb-2">Maintenance Cost Forecast</h3>
          <p className="text-gray-600">
            Predictive analytics to estimate maintenance spending.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default AnalyticsPlusPage;