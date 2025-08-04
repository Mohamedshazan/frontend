'use client';

import { useEffect, useState } from 'react';
import axios from '@/app/lib/api';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

// ---------------------------
// Types
// ---------------------------
type SummaryData = {
  totalAssets: number;
  assignedAssets: number;
  backupAssets?: number;
  toBeDisposedAssets?: number;
  supportPending: number;
  supportInProgress: number;
  supportResolved: number;
  assetsByDepartment?: Record<string, number>;
  assetsByType?: Record<string, number>;
  departmentAssetTypes?: Record<string, Record<string, number>>;
};

// ---------------------------
// Colors for charts
// ---------------------------
const COLORS = [
  '#3B82F6', '#10B981', '#EF4444', '#F59E0B',
  '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6',
];

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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
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
        <StatCard title="To Be Disposed" value={summary.toBeDisposedAssets || 0} color="gray" icon="🗑️" />
        <StatCard title="Support - Pending" value={summary.supportPending} color="orange" icon="⏳" />
        <StatCard title="Support - In Progress" value={summary.supportInProgress} color="yellow" icon="🔧" />
        <StatCard title="Support - Resolved" value={summary.supportResolved} color="emerald" icon="✅" />
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <BreakdownPieChart title="Assets by Department" data={summary.assetsByDepartment} />
        <BreakdownPieChart title="Assets by Type" data={summary.assetsByType} />
      </div>

      {/* Stacked Bar Chart for Department & Type */}
      {summary.departmentAssetTypes && (
        <div className="mt-10 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Assets by Department & Type</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareDepartmentTypeChartData(summary.departmentAssetTypes).chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                {prepareDepartmentTypeChartData(summary.departmentAssetTypes).allTypes.map((type, index) => (
                  <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// Stat Card
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
    gray: ['border-gray-500', 'text-gray-600'],
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
// Pie Chart Breakdown Card
// ---------------------------
function BreakdownPieChart({
  title,
  data = {},
}: {
  title: string;
  data?: Record<string, number>;
}) {
  const entries = Object.entries(data || {});
  const chartData = entries.map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-gray-500 italic">No data available.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------------------------
// Utility: Convert departmentAssetTypes to chart format
// ---------------------------
function prepareDepartmentTypeChartData(departmentAssetTypes: Record<string, Record<string, number>>) {
  const allTypes = new Set<string>();
  const chartData: any[] = [];

  for (const [dept, types] of Object.entries(departmentAssetTypes)) {
    const row: any = { department: dept };
    for (const [type, count] of Object.entries(types)) {
      row[type] = count;
      allTypes.add(type);
    }
    chartData.push(row);
  }

  return { chartData, allTypes: Array.from(allTypes) };
}
