'use client';

import { useEffect, useState } from 'react';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Eye, Edit2, Trash2 } from 'lucide-react';

interface Department {
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: Department;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      } else {
        setError('Failed to load users. Please try again.');
        console.error('Error fetching users:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleEdit = (id: number) => router.push(`/users/edit/${id}`);
  const handleViewAssets = (id: number) => router.push(`/users/${id}/asset-agreement`);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, []);

  // 🔍 Live search filter
  useEffect(() => {
    setFilteredUsers(
      users.filter((u) =>
        [u.name, u.email, u.role, u.department?.name]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-green-700">User Management</h1>
        <button
          onClick={() => router.push('/dashboard/register')}
          className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          disabled={loading}
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </button>
      </header>

      {/* Search bar */}
      <div className="mb-6 flex items-center bg-white border rounded-xl px-4 py-2 shadow-sm w-full sm:w-1/2">
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search users by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus:outline-none text-gray-700"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 h-32 rounded-xl shadow-sm"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-600 space-y-4">
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 py-16 space-y-4">
          <p className="text-lg">No users found.</p>
          <button
            onClick={() => router.push('/dashboard/register')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add your first user
          </button>
        </div>
      ) : (
        // User Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md p-5 border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.name}
                  </h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Dept: {user.department?.name || '—'}
              </p>
              <div className="mt-4 flex gap-2">
                <IconButton
                  icon={<Eye className="w-4 h-4" />}
                  color="teal"
                  onClick={() => handleViewAssets(user.id)}
                  tooltip="View Assets"
                />
                <IconButton
                  icon={<Edit2 className="w-4 h-4" />}
                  color="blue"
                  onClick={() => handleEdit(user.id)}
                  tooltip="Edit User"
                />
                <IconButton
                  icon={<Trash2 className="w-4 h-4" />}
                  color="red"
                  onClick={() => handleDelete(user.id)}
                  tooltip="Delete User"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🎨 Role badge
function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    Admin: 'bg-red-100 text-red-700',
    Manager: 'bg-blue-100 text-blue-700',
    User: 'bg-green-100 text-green-700',
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-medium rounded-full ${
        colors[role] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {role}
    </span>
  );
}

// 🎛️ Modern icon button
function IconButton({
  icon,
  color,
  onClick,
  tooltip,
}: {
  icon: React.ReactNode;
  color: 'teal' | 'blue' | 'red';
  onClick: () => void;
  tooltip: string;
}) {
  const colorMap = {
    teal: 'bg-teal-50 hover:bg-teal-100 text-teal-600',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    red: 'bg-red-50 hover:bg-red-100 text-red-600',
  };

  return (
    <button
      className={`p-2 rounded-lg shadow-sm ${colorMap[color]} transition`}
      onClick={onClick}
      title={tooltip}
    >
      {icon}
    </button>
  );
}
