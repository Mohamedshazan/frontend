'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from '@/app/lib/api';
import { isAxiosError } from 'axios';

interface AssetFormData {
  department_id: string;
  brand: string;
  model: string;
  device_name: string;
  os: string;
  serial_number: string;
  status: 'live' | 'backup' | 'to_be_disposal';
  asset_type: string;
  location: string;
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const asset = res.data;
        setForm({
          department_id: asset.department_id?.toString() || '',
          brand: asset.brand || '',
          model: asset.model || '',
          device_name: asset.device_name || '',
          os: asset.os || '',
          serial_number: asset.serial_number || '',
          status: asset.status || 'live',
          asset_type: asset.asset_type || '',
          location: asset.location || '',
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load asset data.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAsset();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    for (const [key, value] of Object.entries(form)) {
      if (!value && key !== 'os') {
        setError(`${key.replace(/_/g, ' ')} is required.`);
        setSaving(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/assets/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Asset updated!');
      router.push('/dashboard/assets');
    } catch (err: any) {
      if (isAxiosError(err)) {
        const msg = err.response?.data?.message;
        setError(typeof msg === 'string' ? msg : 'Asset update failed.');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded shadow border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Asset</h1>

      {error && (
        <p className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={saving} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField name="asset_type" label="Asset Type" value={form.asset_type} onChange={handleChange} />
          <InputField name="department_id" label="Department ID" value={form.department_id} onChange={handleChange} />
          <InputField name="location" label="Location" value={form.location} onChange={handleChange} />
          <InputField name="device_name" label="Device Name" value={form.device_name} onChange={handleChange} />
          <InputField name="brand" label="Brand" value={form.brand} onChange={handleChange} />
          <InputField name="model" label="Model" value={form.model} onChange={handleChange} />
          <InputField name="serial_number" label="Serial Number" value={form.serial_number} onChange={handleChange} />
          <InputField name="os" label="Operating System" value={form.os} onChange={handleChange} optional />

          <div className="md:col-span-2">
            <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-800">Status</label>
            <select
              name="status"
              id="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="live">Live</option>
              <option value="backup">Backup</option>
              <option value="to_be_disposal">To Be Disposal</option>
            </select>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          {saving ? 'Updating...' : 'Update Asset'}
        </button>
      </form>
    </div>
  );
}

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
      <label htmlFor={name} className="block mb-1 text-sm font-medium text-gray-800">
        {label} {optional && <span className="text-gray-400">(optional)</span>}
      </label>
     <input
  id={name}
  name={name}
  type="text"
  value={value}
  onChange={onChange}
  required={!optional}
  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
/>

    </div>
  );
}



