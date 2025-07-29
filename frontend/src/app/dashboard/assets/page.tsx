'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/app/lib/api';
import AssetFilters from '@/app/components/Assets/AssetFilters';
import AssetTable from '@/app/components/Assets/AssetTable';
import AssetActions from '@/app/components/Assets/AssetActions';

import { Asset, Filters, OptionType, User, Department } from '@/app/components/Assets/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const initialFilters: Filters = {
  status: '',
  asset_type: '',
  department_id: '',
  start_date: '',
  end_date: '',
  user_id: '',
};

export default function AssetListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasMounted, setHasMounted] = useState(false);

  const userOptions: OptionType[] = users.map(user => ({
    value: user.id.toString(),
    label: user.name,
  }));

  const departmentOptions: OptionType[] = departments.map(dep => ({
    value: dep.id.toString(),
    label: dep.name,
  }));

  const assetTypeOptions: OptionType[] = [
    { value: 'Laptop', label: 'Laptop' },
    { value: 'PC', label: 'PC' },
    { value: 'Tablet', label: 'Tablet' },
    { value: 'Monitor', label: 'Monitor' },
    { value: 'Printer', label: 'Printer' },
    { value: 'Smartphone', label: 'Smartphone' },
    { value: 'FeaturePhone', label: 'Feature Phone' },
  ];

  useEffect(() => {
    setHasMounted(true);
    fetchAssets();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchAssets = async (customFilters = filters) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const fixedFilters = {
        ...customFilters,
        user_id: customFilters.user_id ? String(Number(customFilters.user_id)) : '',
      };
      const params = new URLSearchParams(fixedFilters).toString();
      const res = await axios.get(`/assets?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load assets.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  // ✅ Unified filter update and auto-reset
  const handleFilterUpdate = (updated: Partial<Filters>) => {
    const newFilters = { ...filters, ...updated };
    setFilters(newFilters);

    const allEmpty = Object.values(newFilters).every(val => !val || val === '');
    if (allEmpty) {
      setLoading(true);
      fetchAssets(initialFilters); // auto-reset
    }
  };

  const applyFilters = () => {
    setLoading(true);
    fetchAssets(filters);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Delete failed.');
      console.error(err);
    }
  };

 const assignUser = async (assetId: number, userId: string | null) => {
  try {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // 🚫 Prevent assignment to "to_be_disposal"
    if (asset.status === 'to_be_disposal' && userId) {
      toast.error('Cannot assign a user to an asset marked for disposal.');
      return;
    }

    const token = localStorage.getItem('token');
    const selectedUser = users.find(u => u.id.toString() === userId);

    const action = userId ? 'Assigning user...' : 'Unassigning user...';
    const toastId = toast.loading(action);

    if (userId) {
      await axios.post(`/assets/${assetId}/assign`, { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      await axios.post(`/assets/${assetId}/unassign`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // Update local state for both user and status
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? {
              ...a,
              user: selectedUser || null,
              status: userId ? 'live' : 'backup',
            }
          : a
      )
    );

    toast.success(userId ? `Assigned to ${selectedUser?.name}` : 'User unassigned', { id: toastId });
  } catch (err) {
    console.error('Assignment error:', err);
    toast.error('Failed to assign user.');
  }
};

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Asset Management</h1>
          <Link href="/dashboard/assets/create">
            <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
              + Add Asset
            </button>
          </Link>
        </div>

        {/* Filters */}
        <AssetFilters
          filters={filters}
          setFilters={handleFilterUpdate} 
          assetTypeOptions={assetTypeOptions}
          userOptions={userOptions}
          departmentOptions={departmentOptions}
        />

        {/* Filter Action Button */}
        <div className="mt-2 flex justify-end mb-6">
          <button
            onClick={applyFilters}
            className="bg-green-700 text-white px-5 py-2 rounded hover:bg-green-800"
          >
            Apply Filters
          </button>
        </div>

        {/* Export Buttons */}
        <AssetActions assets={assets} users={users} filters={filters} />

        {/* Table */}
        <AssetTable
          assets={assets}
          userOptions={userOptions}
          assignUser={assignUser}
          handleDelete={handleDelete}
          hasMounted={hasMounted}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
