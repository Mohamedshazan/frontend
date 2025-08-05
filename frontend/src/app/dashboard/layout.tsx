'use client';

import { useAuth } from '@/app/dashboard/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  const menuMap: Record<string, { label: string; href: string }[]> = {
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Manage Assets', href: '/dashboard/assets' },
      { label: 'Support Overview', href: '/dashboard/support-requests' },
      { label: 'Reports', href: '/dashboard/reports' },
      { label: 'Register User', href: '/register' },
      { label: 'User management', href: '/users' },
    ],
    'it support': [
      { label: 'Support Tickets', href: '/dashboard/support-requests' },
      { label: 'Asset Inventory', href: '/dashboard/support-requests/assets' },
    ],
    employee: [
      { label: 'Dashboard', href: '/dashboard/employee' },
      { label: 'My Assets', href: '/dashboard/employee' },
      { label: 'My Support Requests', href: '/dashboard/employee/support' },
    ],
  };

  const links = menuMap[user?.role?.toLowerCase() || ''] || [];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">BRANDIX BATI</h1>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className="w-8 h-8 rounded-full object-cover"
                  alt="avatar"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline">{user?.name}</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-10 w-48 bg-white shadow-lg border rounded-lg z-50">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <ul>
                  <li>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      View Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowConfirm(true);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex flex-1">
        <aside
          className={clsx(
            'bg-white shadow-lg border-r transition-all',
            collapsed ? 'w-16' : 'w-64 p-4'
          )}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-4 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            {collapsed ? '➡️' : '⬅️ Collapse'}
          </button>
          {!collapsed && <h2 className="text-xl font-bold mb-4">{user?.role} Panel</h2>}
          <nav className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded text-sm font-medium',
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                )}
              >
                {collapsed ? link.label.charAt(0) : link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
