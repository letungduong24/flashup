'use client';

import useAuthStore from '@/store/auth.store';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Học Flashcard</h1>
    </div>
  );
}

