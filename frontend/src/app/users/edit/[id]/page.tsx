'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/app/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department_id?: number;
}

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState<User>({
    id: 0,
    name: '',
    email: '',
    role: 'Employee',
    department_id: undefined
  });

  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch user details
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [userRes, deptRes] = await Promise.all([
          api.get(`/users/${id}`), // You need a show route in Laravel
          api.get('/departments')
        ]);
        setFormData(userRes.data);
        setDepartments(deptRes.data);
      } catch (err: any) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'department_id' ? (value ? Number(value) : undefined) : value
    }));
  };

  // Save user
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/users/${id}`, formData);
      router.push('/users'); // redirect after save
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="Admin">Admin</option>
            <option value="IT">IT</option>
            <option value="Head">Head</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            name="department_id"
            value={formData.department_id || ''}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">None</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/users')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
