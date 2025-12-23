'use client';
import useAuthStore from '@/store/auth.store';
import React, { useEffect } from 'react'
import { Spinner } from './ui/spinner';
import Loading from './ui/loading';

const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {loading, checkAuth } = useAuthStore();
  useEffect(() => {
     if (loading) {
       checkAuth();
     }
   }, []);

  if (loading) return <Loading />;

  return (
    <div>
      {children}
    </div>
  )
}

export default AuthProvider