'use client';

import useAuthStore from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, signout } = useAuthStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signout();
    router.push('/');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Tên:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Vai trò:</strong> {user?.role}</p>
            {user?.phone && <p><strong>Số điện thoại:</strong> {user.phone}</p>}
            {user?.gender && <p><strong>Giới tính:</strong> {user.gender}</p>}
            {user?.address && <p><strong>Địa chỉ:</strong> {user.address}</p>}
          </div>
        </div>

        <Button onClick={handleSignOut} variant="destructive">
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}

