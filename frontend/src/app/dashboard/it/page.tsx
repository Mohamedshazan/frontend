'use client';

import { useEffect, useState } from 'react';
import axios from '@/app/lib/api';

export default function ITDashboard() {
  const [stats, setStats] = useState({
    assignedAssets: 0,
    unresolvedTickets: 0,
    resolvedTickets: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/dashboard/it', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">IT Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Assigned Assets" value={stats.assignedAssets} />
        <Card title="Unresolved Tickets" value={stats.unresolvedTickets} />
        <Card title="Resolved Tickets" value={stats.resolvedTickets} />
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string, value: number }) {
  return (
    <div className="bg-white rounded shadow p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
