import React from "react";
import { PageContainer } from "./Shared";

const EmailAutomationPage = () => {
  return (
    <PageContainer title="Email Automation Engine">
      <div className="space-y-6">
        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Campaign Builder</h3>
          <p>Create onboarding, payment reminders, renewal campaigns.</p>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Behavior Based Triggering</h3>
          <p>Send automatic emails based on payment delay or complaints.</p>
        </div>

        <div className="p-6 bg-gray-100 rounded-xl">
          <h3 className="font-semibold">Analytics & Open Rates</h3>
          <p>Track click-through, open rates, conversions.</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default EmailAutomationPage;