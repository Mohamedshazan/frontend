'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/app/lib/api';

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    const avatar = localStorage.getItem('userAvatar') || '';
    setUser({ name, avatar });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, name: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', user.name);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('_method', 'PUT');

      const res = await axios.post('/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        const { name, avatarUrl } = res.data;
        localStorage.setItem('userName', name);
        if (avatarUrl) {
          localStorage.setItem('userAvatar', avatarUrl);
        }
        alert('Profile updated successfully!');
        window.location.reload();
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        console.error('❌ Laravel Validation Errors:', err.response.data.errors);
        alert('Validation failed:\n' + JSON.stringify(err.response.data.errors, null, 2));
      } else {
        console.error('❌ Profile update error:', err);
        alert('An error occurred during profile update.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          value={user.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
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
        {(previewUrl || user.avatar) && (
          <img
            src={previewUrl || user.avatar}
            alt="Avatar Preview"
            className="mt-4 w-20 h-20 rounded-full object-cover border"
          />
        )}
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
