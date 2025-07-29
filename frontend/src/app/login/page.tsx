'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/app/lib/api'; 

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
const response = await api.post('login', data); // Don't include `/api/` again, since it's already in baseURL
      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error('Invalid response from server.');
      }

      // ✅ Store token, role, and profile info in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userAvatar', user.avatar); // assuming it's a URL

      // Normalize role for routing (e.g., "IT Support" → "it-support")
      const normalizedRole = user.role.toLowerCase().replace(/\s+/g, '-');

      // Redirect based on role
      if (normalizedRole === 'admin') {
        router.push('/dashboard/admin');
      } else if (normalizedRole === 'it-support') {
        router.push('/dashboard/support-requests');
      } else if (normalizedRole === 'employee') {
        router.push('/dashboard/employee');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Login</h2>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-400'
            }`}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Global Error */}
        {error && (
          <p className="text-red-600 text-center font-medium" role="alert" tabIndex={-1}>
            {error}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 text-white font-medium rounded transition ${
            isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
