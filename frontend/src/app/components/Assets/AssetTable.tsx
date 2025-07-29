// File: components/Assets/AssetTable.tsx
'use client';

import React, { useState } from 'react';
import { Asset, OptionType } from './types';
import Select from 'react-select';
import Link from 'next/link';


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
  if (loading) return <div>Loading assets...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (assets.length === 0) return <div>No assets found.</div>;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-4 pt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by device, brand, model..."
          className="border px-3 py-2 rounded-md text-sm w-full md:w-72 text-gray-900"
        />
        <div className="flex gap-2 items-center">
          <label htmlFor="pageSize" className="text-sm font-medium text-gray-900">Items per page:</label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm text-gray-900"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
         
        </div>
      </div>

     <table className="min-w-full divide-y divide-gray-300 text-sm text-gray-900 mt-2">
  <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600 sticky top-0 z-10">
    <tr>
      <th className="px-4 py-3 text-left whitespace-nowrap">ID</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Serial Number</th> {/* changed */}
      <th className="px-4 py-3 text-left whitespace-nowrap">Brand</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Model</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Type</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Department</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Users</th>
      <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    {currentItems.map(asset => (
      <tr key={asset.id} className="hover:bg-gray-50">
        <td className="px-4 py-3 whitespace-nowrap">{asset.id}</td>
        <td className="px-4 py-3 whitespace-nowrap">{asset.serial_number ?? '—'}</td> {/* changed */}
        <td className="px-4 py-3 whitespace-nowrap">{asset.brand ?? '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{asset.model ?? '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{asset.asset_type ?? '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{statusBadge(asset.status)}</td>
        <td className="px-4 py-3 whitespace-nowrap">{asset.location ?? '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">{asset.department?.name || '—'}</td>
        <td className="px-4 py-3 whitespace-nowrap">
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
        <td className="px-4 py-3 whitespace-nowrap space-x-2">
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
<div className="flex justify-between items-center px-4 py-3 border-t">
  <button
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Previous page"
  >
    Previous
  </button>

  <span className="text-sm text-gray-600">
    Page <span className="font-semibold">{currentPage}</span> of{" "}
    <span className="font-semibold">{totalPages}</span>
  </span>

  <button
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Next page"
  >
    Next
  </button>
</div>

    </div>
  );
}
