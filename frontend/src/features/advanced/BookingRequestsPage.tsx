// advanced/BookingRequestsPage.tsx

import React, { useState } from "react";
import { PageContainer } from "./Shared";

type BookingStatus = "Pending" | "Approved" | "Rejected";

interface BookingRequest {
  id: string;
  name: string;
  email: string;
  property: string;
  roomType: string;
  moveIn: string;
  duration: string;
  amount: number;
  status: BookingStatus;
  priority: "High" | "Medium" | "Low";
}

const mockData: BookingRequest[] = [
  {
    id: "BR-001",
    name: "John Carter",
    email: "john@email.com",
    property: "Downtown PG",
    roomType: "Single Deluxe",
    moveIn: "2026-03-01",
    duration: "6 Months",
    amount: 4200,
    status: "Pending",
    priority: "High",
  },
  {
    id: "BR-002",
    name: "Sarah Lee",
    email: "sarah@email.com",
    property: "City Heights",
    roomType: "Shared Room",
    moveIn: "2026-03-10",
    duration: "3 Months",
    amount: 1800,
    status: "Approved",
    priority: "Medium",
  },
];

const BookingRequestsPage = () => {
  const [requests, setRequests] = useState<BookingRequest[]>(mockData);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "All">("All");

  const updateStatus = (id: string, status: BookingStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status } : req
      )
    );
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(search.toLowerCase()) ||
      req.property.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || req.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <PageContainer title="Booking Requests Management">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        />

        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as BookingStatus | "All")
          }
          className="px-4 py-2 border rounded-lg w-full md:w-1/4"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm uppercase text-gray-600">
              <th className="p-3">Request ID</th>
              <th className="p-3">Resident</th>
              <th className="p-3">Property</th>
              <th className="p-3">Move-In</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map((req) => (
              <tr
                key={req.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="p-3 font-semibold">{req.id}</td>
                <td className="p-3">
                  <div>
                    <p className="font-medium">{req.name}</p>
                    <p className="text-sm text-gray-500">{req.email}</p>
                  </div>
                </td>
                <td className="p-3">
                  {req.property}
                  <div className="text-xs text-gray-500">
                    {req.roomType}
                  </div>
                </td>
                <td className="p-3">{req.moveIn}</td>
                <td className="p-3 font-bold text-green-600">
                  ${req.amount}
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${req.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : req.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                  >
                    {req.priority}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${req.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : req.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                  >
                    {req.status}
                  </span>
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, "Approved")}
                    className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(req.id, "Rejected")}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No booking requests found.
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default BookingRequestsPage;