'use client';

import { useState, type ReactNode, type SVGProps } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthProvider';
import { useLogout } from '@/hooks/useAuthMutations';

function IconShell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconShell {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </IconShell>
  );
}

function SchemesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconShell {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5A2.5 2.5 0 0 1 17.5 21H4Z" />
      <path d="M4 5.5v13A2.5 2.5 0 0 0 6.5 21H4" />
      <path d="M8 8h8M8 12h8" />
    </IconShell>
  );
}

function LessonsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconShell {...props}>
      <path d="M6 3h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M15 3v5h5" />
      <path d="M8 13h8M8 17h5" />
    </IconShell>
  );
}

function StaffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconShell {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M15.5 13.2c2.6.4 4.5 2.6 4.5 5.3" />
    </IconShell>
  );
}

function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.36.5.6 1.51.6H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </IconShell>
  );
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/schemes', label: 'Schemes', icon: SchemesIcon },
  { href: '/lessons', label: 'Lessons', icon: LessonsIcon },
  { href: '/staff', label: 'Staff', icon: StaffIcon, schoolOnly: true },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, account } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = NAV_ITEMS.filter((item) => !item.schoolOnly || account.type === 'school');

  function handleLogout() {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push('/sign-in');
        router.refresh();
      },
    });
  }

  function isActive(href: string) {
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white md:flex">
        <div className="flex items-center gap-2 px-5 py-4">
          <Link href="/dashboard" className="text-lg font-bold text-slate-900">
            easyEd
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-125 group-active:scale-90 group-active:rotate-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {initials(user.displayName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{user.displayName}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="text-lg font-bold text-slate-900">
              easyEd
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-rotate-6 hover:scale-125 hover:bg-slate-100 active:scale-90 active:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {menuOpen && (
            <nav className="border-t border-slate-200 px-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className={`transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-125 group-active:scale-90 group-active:rotate-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Sign out
              </button>
            </nav>
          )}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
