'use client';

import { useEffect, useState } from 'react';
import api from '@/app/lib/api';
import { useRouter } from 'next/navigation';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      setUsers(res.data);
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
      setUsers((prev) => prev.filter((user) => user.id !== id)); // remove from UI
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
      console.error('Error deleting user:', err);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/users/edit/${id}`);
  };

  const handleViewAssets = (id: number) => {
    router.push(`/users/${id}/asset-agreement`);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
        <button
          onClick={() => router.push('/dashboard/register')}
          className="inline-block px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
          aria-label="Add new user"
          disabled={loading}
        >
          + Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite" aria-busy="true">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div>
          <span className="sr-only">Loading users...</span>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 mb-6" role="alert">
          <p className="mb-2">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Retry loading users"
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 py-12 text-lg">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-gray-900 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Role
                </th>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold">
                  Department
                </th>
                <th scope="col" className="px-4 py-3 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <tr key={user.id} className="hover:bg-green-50 focus-within:bg-green-100 transition">
                  <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.role}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.department?.name || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                    <button
                      onClick={() => handleViewAssets(user.id)}
                      className="inline-block px-3 py-1 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      aria-label={`View asset agreement for ${user.name}`}
                      type="button"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(user.id)}
                      className="inline-block px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Edit user ${user.name}`}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="inline-block px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete user ${user.name}`}
                      type="button"
                    >
                      Delete
                    </button>
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
