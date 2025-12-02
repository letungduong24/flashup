'use client';

import useAuthStore from '@/store/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
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
    </div>
  );
}

