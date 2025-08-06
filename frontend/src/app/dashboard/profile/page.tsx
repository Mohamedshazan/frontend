'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/lib/api';
import { useUser } from '@/app/dashboard/context/UserContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { setUser, user } = useUser();
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user into form when context changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPreviewUrl(user.avatarUrl || null);
    }
  }, [user]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file.');
        return;
      }

      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      formData.append('_method', 'PUT');

      const res = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.status === 200) {
        const { name, avatarUrl } = res.data;

        // Update user context instantly
        setUser((prev) => ({
          ...prev,
          name,
          avatarUrl: avatarUrl || prev?.avatarUrl,
        }));

        // Save to localStorage
        localStorage.setItem('userName', name);
        if (avatarUrl) {
          localStorage.setItem('userAvatar', avatarUrl);
        }

        toast.success('Profile updated successfully!');
        setTimeout(() => {
          router.push('/dashboard/admin');
        }, 1200);
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

  const hasChanges =
    name.trim() !== (user?.name || '') || avatarFile !== null;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Name Field */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your name"
        />
      </div>

      {/* Avatar Upload */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Avatar Preview"
            className="mt-4 w-20 h-20 rounded-full object-cover border"
          />
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading || !hasChanges}
        className={`px-4 py-2 rounded text-white transition-colors ${
          loading || !hasChanges
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
