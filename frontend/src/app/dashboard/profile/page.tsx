'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/lib/api';
import { useUser } from '@/app/dashboard/context/UserContext';

export default function ProfilePage() {
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(localStorage.getItem('userName') || '');
    setAvatar(localStorage.getItem('userAvatar') || '');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('_method', 'PUT');

      const res = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        const { name, avatarUrl } = res.data;

        // Save in localStorage
        localStorage.setItem('userName', name);
        if (avatarUrl) localStorage.setItem('userAvatar', avatarUrl);

        // Update global context
        setUser((prev) => ({
          ...prev,
          name,
          avatarUrl: avatarUrl || prev?.avatarUrl,
        }));

        setSuccess('Profile updated successfully!');
        setAvatar(avatarUrl || avatar);
        setAvatarFile(null);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setError(Object.values(err.response.data.errors).flat().join('\n'));
      } else {
        setError('An error occurred during profile update.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profileee</h1>

      {error && <p className="mb-4 text-red-500">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full"
        />
        {(previewUrl || avatar) && (
          <img
            src={previewUrl || avatar}
            alt="Avatar Preview"
            className="mt-4 w-20 h-20 rounded-full object-cover border"
          />
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

