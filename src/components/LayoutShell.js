'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ShellInner({ children }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname ? pathname.startsWith('/dashboard') : false;

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <main className="flex-1 w-full flex flex-col">{children}</main>
      {!isDashboardRoute && <Footer />}
    </>
  );
}

export default function LayoutShell({ children }) {
  return (
    <Suspense fallback={<main className="flex-1 w-full flex flex-col">{children}</main>}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
