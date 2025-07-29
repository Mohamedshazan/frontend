// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {/* Toast notifications */}
        <Toaster position="top-right" />
        
        {/* App content */}
        {children}
      </body>
    </html>
  );
}
