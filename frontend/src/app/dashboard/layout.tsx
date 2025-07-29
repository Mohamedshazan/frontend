"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

type User = {
  name?: string;
  avatarUrl?: string;
  role: string;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    const avatarUrl = localStorage.getItem('userAvatar');

    if (!token || !role) {
      router.push('/login');
      return;
    }

    setUser({
      name: name || 'User',
      avatarUrl: avatarUrl || '',
      role: role.toLowerCase(),
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    router.push('/login');
  };

  const menuMap: Record<string, { label: string; href: string }[]> = {
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin' },
      { label: 'Manage Assets', href: '/dashboard/assets' },
      { label: 'Support Overview', href: '/dashboard/support-requests' },
      { label: 'Reports', href: '/dashboard/reports' },
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

  const links = menuMap[user?.role || ''] || [];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center relative">
          <h1 className="text-lg font-semibold text-gray-800">BRANDIX BATI</h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-700">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.name}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ul className="text-sm text-gray-700">
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
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={clsx(
            'bg-white shadow-lg border-r border-gray-200 transition-all duration-300',
            'h-screen sticky top-0',
            collapsed ? 'w-16' : 'w-64 p-4'
          )}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mb-4 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            {collapsed ? '➡️' : '⬅️ Collapse'}
          </button>
          {!collapsed && (
            <h2 className="text-xl font-bold text-gray-800 capitalize mb-4">
              {user.role} Panel
            </h2>
          )}
          <nav className="flex flex-col space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  'px-3 py-2 rounded text-sm font-medium transition whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100',
                  collapsed && 'text-center px-1'
                )}
              >
                {collapsed ? link.label.charAt(0) : link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto h-screen p-6 text-gray-800">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Logout</h2>
            <p className="text-sm text-gray-700 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
