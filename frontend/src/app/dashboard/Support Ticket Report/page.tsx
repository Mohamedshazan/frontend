'use client';

import { useState } from 'react';
import axios from '@/app/lib/api';

type Ticket = {
  id: string;
  subject: string;
  status: string;
  priority?: string;
  user?: {
    name?: string;
  };
  department?: {
    name?: string;
  };
  created_at?: string;
};

export default function TicketReportsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    user: '',
    status: '',
    priority: '',
    from_date: '',
    to_date: '',
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/report/support-requests', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      setTickets(response.data);
    } catch (err) {
      console.error('Fetch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const exportTickets = async (format: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/report/support-requests/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `support_tickets_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      user: '',
      status: '',
      priority: '',
      from_date: '',
      to_date: '',
    });
    setTickets([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Support Ticket Report</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: 'Department', key: 'department', placeholder: 'e.g. HR' },
          { label: 'User', key: 'user', placeholder: 'e.g. John' },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              value={(filters as any)[key]}
              onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
              className="w-full px-3 py-2 border rounded"
              placeholder={placeholder}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-white"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-white"
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={fetchTickets} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
          Apply Filters
        </button>
        <button onClick={() => exportTickets('csv')} className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700">
          Export CSV
        </button>
        <button onClick={() => exportTickets('pdf')} className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700">
          Export PDF
        </button>
        <button onClick={clearFilters} className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700">
          Clear Filters
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500 py-10">🔍 No support tickets found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">User</th>
                <th className="p-3">Department</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, index) => (
                <tr key={ticket.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{ticket.subject}</td>
                  <td className="p-3 capitalize">{ticket.status}</td>
                  <td className="p-3 capitalize">{ticket.priority || '—'}</td>
                  <td className="p-3">{ticket.user?.name || '—'}</td>
                  <td className="p-3">{ticket.department?.name || '—'}</td>
                  <td className="p-3">
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
