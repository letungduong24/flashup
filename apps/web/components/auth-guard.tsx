'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth.store';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard component để bảo vệ routes
 * @param requireAuth - Nếu true, yêu cầu đăng nhập. Nếu false, chỉ cho phép truy cập khi chưa đăng nhập
 * @param redirectTo - Route để redirect khi không thỏa điều kiện
 */
export default function AuthGuard({ 
  children, 
  redirectTo = '/signin',
  requireAuth = true,
}: AuthGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  

  useEffect(() => {
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    if(!requireAuth && user ) {
      router.push('/');
      return;
    }
  }, [user, redirectTo, router, requireAuth]);

  return <>{children}</>;
}

