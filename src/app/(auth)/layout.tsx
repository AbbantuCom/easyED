import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-lg font-bold text-slate-900">
        easyEd
      </Link>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
