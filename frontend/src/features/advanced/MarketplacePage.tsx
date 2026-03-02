import React from "react";
import { PageContainer } from "./Shared";

const MarketplacePage = () => {
  return (
    <PageContainer title="Service Marketplace">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-semibold">Laundry Services</h3>
          <p>Integrated booking + payments.</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-semibold">Food Subscription</h3>
          <p>Monthly meal plan integration.</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="font-semibold">Cleaning & Repairs</h3>
          <p>On-demand vendor system.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default MarketplacePage;