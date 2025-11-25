import AuthGuard from '@/components/auth-guard';

export const metadata = {
  title: 'ToeUp - Protected',
  description: 'Trang được bảo vệ yêu cầu đăng nhập',
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo="/signin">
      {children}
    </AuthGuard>
  );
}

