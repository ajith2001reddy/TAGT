import React from "react";
import { PageContainer } from "./Shared";

const NotificationCenterPage = () => {
  return (
    <PageContainer title="Notification Center">
      <ul className="space-y-4">
        <li className="p-4 bg-blue-100 rounded-lg">
          Payment received from John – $750
        </li>
        <li className="p-4 bg-red-100 rounded-lg">
          Maintenance issue reported – Room 204
        </li>
        <li className="p-4 bg-green-100 rounded-lg">
          Lease renewal confirmed – Sarah
        </li>
      </ul>
    </PageContainer>
  );
};

export default NotificationCenterPage;