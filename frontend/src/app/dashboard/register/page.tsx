'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from '@/app/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['Admin', 'IT', 'Head', 'Employee'], {
    message: 'Please select a valid role.',
  }),
  department_name: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('User registered!');
      router.push('/dashboard/admin');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg space-y-5 border border-gray-200"
        noValidate
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Register New User</h2>
        <p className="text-sm text-center text-gray-500 mb-4">Only Admins can create users</p>

        {/* Name */}
        <div>
          <label htmlFor="name" className="text-gray-700 font-medium">Name</label>
          <input
            id="name"
            {...register('name')}
            placeholder="Full Name"
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-gray-700 font-medium">Email</label>
          <input
            id="email"
            {...register('email')}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="text-gray-700 font-medium">Password</label>
          <input
            id="password"
            {...register('password')}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="text-gray-700 font-medium">Role</label>
          <select
            {...register('role')}
            id="role"
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            {/* <option value="IT">IT</option>
            <option value="Head">Head</option> */}
            <option value="Employee">Employee</option>
          </select>
          {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>}
        </div>

        {/* Department Name */}
        <div>
          <label htmlFor="department_name" className="text-gray-700 font-medium">Department (optional)</label>
          <input
            id="department_name"
            {...register('department_name')}
            placeholder="Department Name"
            className="w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-100 px-4 py-2 rounded text-center">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 text-white font-semibold rounded-md bg-blue-600 hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}
