// File: components/Assets/AssetFilters.tsx
'use client';

import React from 'react';
import Select from 'react-select';
import { OptionType, Filters } from './types';

const statusOptions: OptionType[] = [
  { label: 'Live', value: 'live' },
  { label: 'To be Disposal', value: 'to_be_disposal' },
  { label: 'Backup', value: 'backup' },
];


const customStyles = {
  menu: (provided: any) => ({
    ...provided,
    zIndex: 20
  }),
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
  filters: Filters;
  setFilters: (filters: Filters) => void;
  userOptions: OptionType[];
  departmentOptions: OptionType[];
  assetTypeOptions: OptionType[];
};

export default function AssetFilters({ filters, setFilters, userOptions, departmentOptions, assetTypeOptions }: Props) {
  return (
    <div className="bg-white rounded shadow border border-gray-200 p-4 space-y-4 text-sm text-gray-900">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label htmlFor="asset_type"className="mb-1 font-medium dark:text-gray-900">Asset Type</label>
          <Select
            inputId="asset_type"
            isClearable
            isSearchable
            placeholder="Search or select asset type"
            options={assetTypeOptions}
            value={assetTypeOptions.find(opt => opt.value === filters.asset_type) || null}
            onChange={(selected) => setFilters({ ...filters, asset_type: selected?.value || '' })}
            className="text-sm"
            styles={customStyles}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="department_id" className="mb-1 font-medium dark:text-gray-900">Department</label>
          <Select
            inputId="department_id"
            isClearable
            isSearchable
            placeholder="Select or search department"
            options={departmentOptions}
            value={departmentOptions.find(opt => opt.value === filters.department_id) || null}
            onChange={(selected) => setFilters({ ...filters, department_id: selected?.value || '' })}
            className="text-sm"
            styles={customStyles}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="user_id" className="mb-1 font-medium dark:text-gray-900">Assigned User</label>
          <Select
            inputId="user_id"
            isClearable
            isSearchable
            placeholder="Select or search user"
            options={userOptions}
            value={userOptions.find(opt => opt.value === filters.user_id) || null}
            onChange={(selected) => setFilters({ ...filters, user_id: selected?.value || '' })}
            className="text-sm"
            styles={customStyles}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="status" className="mb-1 font-medium dark:text-gray-900">Status</label>
          <Select
            inputId="status"
            isClearable
            isSearchable
            placeholder="Select status"
            options={statusOptions}
            value={statusOptions.find(opt => opt.value === filters.status) || null}
            onChange={(selected) => setFilters({ ...filters, status: selected?.value || '' })}
            className="text-sm"
            styles={customStyles}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="created_from" className="mb-1 font-medium dark:text-gray-900">Created From</label>
          <input
            type="date"
            id="created_from"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
            value={filters.created_from}
            onChange={(e) => setFilters({ ...filters, created_from: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="created_to" className="mb-1 font-medium dark:text-gray-900">Created To</label>
          <input
            type="date"
            id="created_to"
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
            value={filters.created_to}
            onChange={(e) => setFilters({ ...filters, created_to: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
