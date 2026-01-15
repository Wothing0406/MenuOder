import React from 'react';

export default function DashboardCard({ children, className = '' }) {
  return (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 sm:h-40 ${className}`}>
      {children}
    </div>
  );
}


