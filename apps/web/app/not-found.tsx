import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar01 } from '@/components/ui/shadcn-io/navbar-01';
import NavbarProvider from '@/components/navbar-provider';

export default function NotFound() {
  return (
    <NavbarProvider>
      <div className="flex-1 flex items-center justify-center">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="mt-4 text-2xl font-semibold">Không tìm thấy trang</h2>
        </div>
      </div>
    </NavbarProvider>
  );
}

