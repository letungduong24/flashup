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
  requireAuth = true,
  redirectTo = '/signin'
}: AuthGuardProps) {
  const router = useRouter();
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Kiểm tra auth khi component mount nếu đang loading
    if (loading) {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    // Nếu đang loading, không làm gì
    if (loading) return;

    // Nếu requireAuth = true và chưa đăng nhập -> redirect
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // Nếu requireAuth = false và đã đăng nhập -> redirect về home
    if (!requireAuth && user) {
      router.push('/');
      return;
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  // Nếu requireAuth = true và chưa đăng nhập -> không render children
  if (requireAuth && !user) {
    return null;
  }

  // Nếu requireAuth = false và đã đăng nhập -> không render children
  if (!requireAuth && user) {
    return null;
  }

  // Render children nếu thỏa điều kiện
  return <>{children}</>;
}

