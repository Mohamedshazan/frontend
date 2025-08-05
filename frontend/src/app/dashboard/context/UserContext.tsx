'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  name?: string;
  avatarUrl?: string;
  role?: string;
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ✅ TS-safe
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    const avatarUrl = localStorage.getItem('userAvatar');

    if (token && role) {
      setUser({
        name: name || 'User',
        avatarUrl: avatarUrl || '',
        role: role.toLowerCase(),
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
