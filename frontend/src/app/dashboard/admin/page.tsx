'use client';

import { useEffect, useState } from 'react';
import axios from '@/app/lib/api';
import toast from 'react-hot-toast';

// ---------------------------
// Types
// ---------------------------
type SummaryData = {
  totalAssets: number;
  assignedAssets: number;
  backupAssets?: number;
  supportPending: number;
  supportInProgress: number;
  supportResolved: number;
  assetsByDepartment?: Record<string, number>;
  assetsByType?: Record<string, number>;
};

// ---------------------------
// Main Component
// ---------------------------
export default function AdminSummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/dashboard/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

const backupAssets = summary?.backupAssets || 0;


  // ---------------------------
  // Loading State
  // ---------------------------
  if (loading || !summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-700 animate-pulse">Loading Dashboard...</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 h-24 rounded shadow animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800"> Dashboard</h1>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard title="Total Assets" value={summary.totalAssets} color="blue" icon="💼" />
        <StatCard title="Live Assets" value={summary.assignedAssets} color="green" icon="📦" />
        <StatCard title="Backup Assets" value={backupAssets} color="red" icon="🧰" />
        <StatCard title="Support - Pending" value={summary.supportPending} color="orange" icon="⏳" />
        <StatCard title="Support - In Progress" value={summary.supportInProgress} color="yellow" icon="🔧" />
        <StatCard title="Support - Resolved" value={summary.supportResolved} color="emerald" icon="✅" />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <BreakdownCard title="Assets by Department" data={summary.assetsByDepartment} />
        <BreakdownCard title="Assets by Type" data={summary.assetsByType} />
      </div>
    </div>
  );
}

// ---------------------------
// Stat Card Component
// ---------------------------
function StatCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon?: string;
}) {
  const colorMap: Record<string, string[]> = {
    blue: ['border-blue-500', 'text-blue-600'],
    green: ['border-green-500', 'text-green-600'],
    red: ['border-red-500', 'text-red-600'],
    orange: ['border-orange-500', 'text-orange-600'],
    yellow: ['border-yellow-500', 'text-yellow-600'],
    emerald: ['border-emerald-500', 'text-emerald-600'],
  };

  const [borderColor, textColor] = colorMap[color] || ['border-gray-300', 'text-gray-600'];

  return (
    <div className={`bg-white border-l-4 ${borderColor} shadow rounded-lg p-5`}>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-700">{title}</h2>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );
}

// ---------------------------
// Breakdown Card Component
// ---------------------------
function BreakdownCard({
  title,
  data = {},
}: {
  title: string;
  data?: Record<string, number>;
}) {
  const entries = Object.entries(data || {});

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-gray-500 italic">No data available.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {entries.map(([key, count]) => (
            <li key={key} className="flex justify-between py-2 text-sm text-gray-700">
              <span>{key}</span>
              <span className="font-semibold">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
