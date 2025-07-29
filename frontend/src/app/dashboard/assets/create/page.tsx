'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/lib/api';
import { isAxiosError } from 'axios';

interface AssetFormData {
  department_id: string;
  brand: string;
  model: string;
  device_name: string;
  os: string;
  serial_number: string;
  status: 'live' | 'to_be_disposal' | 'backup';
  asset_type: string;
  location: string;
}

export default function CreateAssetPage() {
  const router = useRouter();

  const [form, setForm] = useState<AssetFormData>({
    department_id: '',
    brand: '',
    model: '',
    device_name: '',
    os: '',
    serial_number: '',
    status: 'live',
    asset_type: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    for (const [key, value] of Object.entries(form)) {
      if (!value?.toString().trim() && key !== 'os') {
        setError(`${key.replace(/_/g, ' ')} is required.`);
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post('/assets', form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Asset created successfully!');
      router.push('/dashboard/assets');
    } catch (err: any) {
      if (isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        setError(
          typeof apiMessage === 'string'
            ? apiMessage
            : Array.isArray(apiMessage)
            ? apiMessage.join(', ')
            : 'Asset creation failed.'
        );
        console.error('Backend error:', err.response?.data);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-12 bg-white rounded-xl shadow border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Assets</h1>

      {error && (
        <p className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6 border border-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <fieldset disabled={loading} className="space-y-8">
          {/* Asset Type Selector */}
          <div>
            <label htmlFor="asset_type" className="block text-sm font-semibold text-gray-800 mb-1">Asset Type</label>
            <select
              name="asset_type"
              id="asset_type"
              value={form.asset_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">Select asset type</option>
              <option value="Laptop">Laptop</option>
              <option value="PC">PC</option>
              <option value="Tablet">Tablet</option>
              <option value="Monitor">Monitor</option>
              <option value="Printer">Printer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {form.asset_type && (
            <>
              {/* General Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">General Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField name="department_id" label="Department ID" value={form.department_id} onChange={handleChange} />
                  <InputField name="location" label="Location" value={form.location} onChange={handleChange} />
                </div>
              </div>

              {/* Asset Specific Info */}
              {(form.asset_type === 'Laptop' || form.asset_type === 'PC') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">{form.asset_type} Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField name="brand" label="Brand" value={form.brand} onChange={handleChange} />
                    <InputField name="model" label="Model" value={form.model} onChange={handleChange} />
                    <InputField name="device_name" label="Device Name" value={form.device_name} onChange={handleChange} />
                    <InputField name="serial_number" label="Serial Number" value={form.serial_number} onChange={handleChange} />
                    <InputField name="os" label="Operating System" value={form.os} onChange={handleChange} optional />
                  </div>
                </div>
              )}

              {form.asset_type === 'Tablet' && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Tablet Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      placeholder="Screen Size (e.g. 10.2 inch)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="Tablet Type (e.g. iPad, Android)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Asset Status</h2>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"
                >
                  <option value="live">Live</option>
                  <option value="to_be_disposal">To Be Disposal</option>
                  <option value="backup">Backup</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-center bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Create Asset'}
              </button>
            </>
          )}
        </fieldset>
      </form>
    </div>
  );
}

/**
 * Reusable input field
 */
function InputField({
  name,
  label,
  value,
  onChange,
  optional = false,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-800 mb-1">
        {label}{optional ? ' (Optional)' : ''}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        required={!optional}
        className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
      />
    </div>
  );
}
