'use client';

import React, { useState } from 'react';
import { Asset, OptionType } from './types';
import Select from 'react-select';
import Link from 'next/link';
import { Search, AlertCircle } from 'lucide-react';

const statusBadge = (status: string) => {
  const base = 'px-2 py-1 text-xs rounded-full font-semibold';
  switch (status.toLowerCase()) {
    case 'live':
      return <span className={`${base} bg-green-100 text-green-800`}>Live</span>;
    case 'backup':
      return <span className={`${base} bg-blue-100 text-blue-800`}>Backup</span>;
    case 'to_be_disposal':
      return <span className={`${base} bg-yellow-100 text-yellow-800`}>To be Disposal</span>;
    case 'decommissioned':
      return <span className={`${base} bg-red-100 text-red-800`}>Decommissioned</span>;
    default:
      return <span className={`${base} bg-gray-100 text-gray-800`}>{status}</span>;
  }
};

const customSelectStyles = {
  menu: (provided: any) => ({ ...provided, zIndex: 20 }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    color: '#1f2937'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#f3f4f6' : 'white',
    color: '#1f2937'
  })
};

type Props = {
  assets: Asset[];
  userOptions: OptionType[];
  assignUser: (assetId: number, userId: string | null) => void;
  handleDelete: (id: number) => void;
  hasMounted: boolean;
  loading: boolean;
  error: string;
};

export default function AssetTable({
  assets,
  userOptions,
  assignUser,
  handleDelete,
  hasMounted,
  loading,
  error,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  if (!hasMounted) return null;
  if (loading) return <div className="p-4 text-gray-700">Loading assets...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (assets.length === 0)
    return (
      <div className="flex items-center gap-2 p-4 text-gray-600">
        <AlertCircle className="w-5 h-5" /> No assets found.
      </div>
    );

  const filteredAssets = assets.filter(asset =>
    (asset.device ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.brand ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (asset.model ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  return (
    <div className="overflow-x-auto bg-white rounded shadow border border-gray-200">
      {/* Search & Page Size */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 pt-4 sticky top-0 bg-white z-10 border-b">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by device, brand, model..."
            className="border pl-8 pr-3 py-2 rounded-md text-sm w-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label htmlFor="pageSize" className="text-sm font-medium text-gray-900">Items per page:</label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full divide-y divide-gray-300 text-sm text-gray-900">
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Serial Number</th>
            <th className="px-4 py-3 text-left">Brand</th>
            <th className="px-4 py-3 text-left">Model</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Location</th>
            <th className="px-4 py-3 text-left">Department</th>
            <th className="px-4 py-3 text-left">Users</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentItems.map(asset => (
            <tr key={asset.id} className="hover:bg-gray-50 even:bg-gray-50/40 transition">
              <td className="px-4 py-3">{asset.id}</td>
              <td className="px-4 py-3">{asset.serial_number ?? '—'}</td>
              <td className="px-4 py-3">{asset.brand ?? '—'}</td>
              <td className="px-4 py-3">{asset.model ?? '—'}</td>
              <td className="px-4 py-3">{asset.asset_type ?? '—'}</td>
              <td className="px-4 py-3">{statusBadge(asset.status)}</td>
              <td className="px-4 py-3">{asset.location ?? '—'}</td>
              <td className="px-4 py-3">{asset.department?.name || '—'}</td>
              <td className="px-4 py-3">
                <Select
                  value={asset.user ? { label: asset.user.name, value: asset.user.id.toString() } : null}
                  onChange={(selected) => assignUser(asset.id, selected?.value || null)}
                  options={userOptions}
                  isClearable
                  placeholder="Assign user"
                  className="w-44 text-sm"
                  styles={customSelectStyles}
                />
              </td>
              <td className="px-4 py-3 space-x-2">
                <Link href={`/dashboard/assets/${asset.id}/edit`}>
                  <button className="text-blue-600 hover:underline text-sm font-semibold">Edit</button>
                </Link>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="text-red-600 hover:underline text-sm font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center px-4 py-3 border-t bg-gray-50">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <span className="text-sm text-gray-600">
          Page <span className="font-semibold">{currentPage}</span> of{' '}
          <span className="font-semibold">{totalPages}</span>
        </span>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
