'use client';

import { useEffect, useState } from 'react';
import axios from '@/app/lib/api';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useSearchParams } from 'next/navigation'; // ✅ NEW

type Ticket = {
  id: number;
  subject: string;
  issue: string;
  status: string;
  priority: string;
  user?: { name: string };
  department?: { name: string };
  created_at?: string;
};

const statusOptions = [
  { value: 'pending', label: 'pending', color: '#facc15' },
  { value: 'In Progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'resolved', label: 'resolved', color: '#22c55e' },
];

const customStyles = {
  option: (styles: any, { data, isFocused }: any) => ({
    ...styles,
    backgroundColor: isFocused ? `${data.color}20` : 'white',
    color: data.color,
    fontWeight: 500,
  }),
  singleValue: (styles: any, { data }: any) => ({
    ...styles,
    color: data.color,
    fontWeight: 600,
  }),
  control: (styles: any) => ({
    ...styles,
    minHeight: '28px',
    fontSize: '0.85rem',
    borderColor: '#d1d5db',
    boxShadow: 'none',
  }),
  dropdownIndicator: (base: any) => ({ ...base, padding: 4 }),
  indicatorSeparator: () => null,
  menu: (base: any) => ({ ...base, zIndex: 999 }),
};

export default function SupportRequestPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    user: '',
    status: '',
    priority: '',
    from_date: '',
    to_date: '',
  });

  const searchParams = useSearchParams(); // ✅

  useEffect(() => {
    // ✅ On page load or when query changes, sync filters
    const statusParam = searchParams.get('status') || '';
    const newFilters = { ...filters, status: statusParam };
    setFilters(newFilters);
    fetchTickets(newFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchTickets = async (customFilters = filters) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/support-requests', {
        headers: { Authorization: `Bearer ${token}` },
        params: customFilters,
      });
      setTickets(response.data);
    } catch (err) {
      toast.error('Failed to fetch support requests');
    } finally {
      setLoading(false);
    }
  };

  const exportTickets = async (format: 'csv' | 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/report/support-requests/export/${format}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `support_requests.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/support-requests/${ticketId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );

      toast.success('Status updated');
      setEditingStatusId(null);
    } catch (error) {
      toast.error('Failed to update status');
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Support Requests</h1>

      {/* Filters */}
      <div className="bg-white text-black grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8 p-5 border rounded-md shadow-sm">
        {[
          { label: 'Department', name: 'department' },
          { label: 'User', name: 'user' },
          {
            label: 'Status',
            name: 'status',
            type: 'select',
            options: ['', 'pending', 'In Progress', 'resolved'],
          },
          {
            label: 'Priority',
            name: 'priority',
            type: 'select',
            options: ['', 'low', 'medium', 'high'],
          },
          { label: 'From Date', name: 'from_date', type: 'date' },
          { label: 'To Date', name: 'to_date', type: 'date' },
        ].map(({ label, name, type = 'text', options }) => (
          <div key={name} className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
            {type === 'select' ? (
              <select
                value={filters[name as keyof typeof filters]}
                onChange={(e) => setFilters({ ...filters, [name]: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || 'All'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={filters[name as keyof typeof filters]}
                onChange={(e) => setFilters({ ...filters, [name]: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => fetchTickets(filters)}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Apply
        </button>
        <button
          onClick={() => exportTickets('csv')}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Export CSV
        </button>
        <button
          onClick={() => exportTickets('pdf')}
          className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
        >
          Export PDF
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : tickets.length === 0 ? (
        <p className="text-center text-gray-500 py-10">🔍 No support requests found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md shadow border">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left text-gray-800">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket, idx) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{ticket.subject}</td>
                  <td className="px-4 py-3">{ticket.issue}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {editingStatusId === ticket.id ? (
                        <div className="w-[140px]">
                          <Select
                            value={statusOptions.find((opt) => opt.value === ticket.status)}
                            onChange={(selected) =>
                              handleStatusChange(ticket.id, selected?.value || ticket.status)
                            }
                            options={statusOptions}
                            styles={customStyles}
                            isSearchable={false}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold
                              ${ticket.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : ticket.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : ticket.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-200 text-gray-800'}
                            `}
                          >
                            {ticket.status}
                          </span>
                          <button
                            onClick={() => setEditingStatusId(ticket.id)}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            ✏️
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{ticket.priority}</td>
                  <td className="px-4 py-3">{ticket.user?.name || '—'}</td>
                  <td className="px-4 py-3">{ticket.department?.name || '—'}</td>
                  <td className="px-4 py-3">
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
