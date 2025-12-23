import { DashboardWrapper } from '@/components/dashboard/dashboard-wrapper';

export const metadata = {
  title: 'FlashUp - Học tập',
  description: 'Nền tảng học tập trực tuyến giúp bạn nâng cao kiến thức và kỹ năng một cách hiệu quả.',
};

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}

