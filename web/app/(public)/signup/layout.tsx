import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Đăng ký FlashUp',
  description: 'Ứng dụng học Toeic sử dụng AI để tạo Flashcard, luyện đề và gợi ý chiến lược học phù hợp với bạn.',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
}

export default Layout

