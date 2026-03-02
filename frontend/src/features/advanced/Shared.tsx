// advanced/Shared.tsx

import React from "react";

export const PageContainer: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
}) => {
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Advanced enterprise management module
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
                {children}
            </div>
        </div>
    );
};

export const StatCard: React.FC<{
    title: string;
    value: string;
}> = ({ title, value }) => (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-xl shadow-md">
        <p className="text-sm opacity-80">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
    </div>
);