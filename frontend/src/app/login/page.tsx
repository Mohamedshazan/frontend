'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from '@/app/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const [error, setError] = useState('');
  const router = useRouter();

 const onSubmit = async (data: LoginForm) => {
  setError('');
  try {
    const { data: res } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      data
    );

    if (!res.token) throw new Error('Invalid server response');

    // Save auth details
    localStorage.setItem('token', res.token);
    localStorage.setItem('role', res.role);
    localStorage.setItem('userName', res.name);
    if (res.avatarUrl) {
      localStorage.setItem('userAvatar', res.avatarUrl);
    }

    // Redirect based on role
    const normalizedRole = res.role.toLowerCase();
    if (normalizedRole === 'admin') router.push('/dashboard/admin');
    else if (normalizedRole === 'it') router.push('/dashboard/support-requests');
    else if (normalizedRole === 'employee') router.push('/dashboard/employee');
    else router.push('/dashboard');
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Login failed.';
    setError(errorMsg);
  }
};



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">Welcome to brandix Batti</h2>
        <p className="text-sm text-gray-500 text-center">Please sign in to your account</p>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
              }`}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className={`w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'
              }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="text-red-600 text-center text-sm bg-red-100 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

