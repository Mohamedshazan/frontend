'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

const COLORS = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6', '#14B8A6'];

export default function AdminSummary() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleCardClick = (filterType: string) => {
  let queryParams: Record<string, string> = {};
  let basePath = '/dashboard/assets'; // default for assets

  switch (filterType) {
    case 'Total Assets':
      queryParams = {};
      break;
    case 'Live Assets':
      queryParams = { status: 'live' };
      break;
    case 'Backup Assets':
      queryParams = { status: 'backup' };
      break;
    case 'To Be Disposed':
      queryParams = { status: 'to_be_disposal' };
      break;

    // ✅ Support cards now go to /dashboard/support-requests
    case 'Support - Pending':
      queryParams = { status: 'pending' };
      basePath = '/dashboard/support-requests';
      break;
    case 'Support - In Progress':
      queryParams = { status: 'In Progress' };
      basePath = '/dashboard/support-requests';
      break;
    case 'Support - Resolved':
      queryParams = { status: 'resolved' };
      basePath = '/dashboard/support-requests';
      break;
  }

  const search = new URLSearchParams(queryParams).toString();
  router.push(`${basePath}?${search}`);
};

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

  const backupAssets = summary.backupAssets || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <button
          onClick={fetchSummary}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard title="Total Assets" value={summary.totalAssets} color="blue" icon="💼" onClick={() => handleCardClick('Total Assets')} />
        <StatCard title="Live Assets" value={summary.assignedAssets} color="green" icon="📦" onClick={() => handleCardClick('Live Assets')} />
        <StatCard title="Backup Assets" value={backupAssets} color="red" icon="🧰" onClick={() => handleCardClick('Backup Assets')} />
        <StatCard title="To Be Disposed" value={summary.toBeDisposedAssets || 0} color="gray" icon="🗑️" onClick={() => handleCardClick('To Be Disposed')} />
        <StatCard title="Support - Pending" value={summary.supportPending} color="orange" icon="⏳" onClick={() => handleCardClick('Support - Pending')} />
        <StatCard title="Support - In Progress" value={summary.supportInProgress} color="yellow" icon="🔧" onClick={() => handleCardClick('Support - In Progress')} />
        <StatCard title="Support - Resolved" value={summary.supportResolved} color="emerald" icon="✅" onClick={() => handleCardClick('Support - Resolved')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <BreakdownPieChart title="Assets by Department" data={summary.assetsByDepartment} onClick={(dept) => router.push(`/dashboard/assets?department_id=${dept}`)} />
        <BreakdownPieChart title="Assets by Type" data={summary.assetsByType} onClick={(type) => router.push(`/dashboard/assets?asset_type=${type}`)} />
      </div>

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

function StatCard({ title, value, color, icon, onClick }: { title: string; value: number; color: string; icon?: string; onClick?: () => void }) {
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
    <div onClick={onClick} className={`bg-white border-l-4 ${borderColor} shadow rounded-lg p-5 cursor-pointer hover:shadow-lg transition`}>
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold text-gray-700">{title}</h2>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
    </div>
  );
}

function BreakdownPieChart({ title, data = {}, onClick }: { title: string; data?: Record<string, number>; onClick?: (key: string) => void }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {chartData.length === 0 ? <p className="text-gray-500 italic">No data available.</p> : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label
                onClick={(entry: any) => onClick && onClick(entry.name)}
              >
                {chartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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
