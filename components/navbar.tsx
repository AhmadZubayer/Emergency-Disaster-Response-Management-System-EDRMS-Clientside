'use client';

import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X } from 'lucide-react';
import AuthDialog from '@/components/auth-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';

const links = [
  ['Alerts', '/alerts'],
  ['Missing Person', '/missing-persons'],
  ['Rescue Requests', '/rescue-requests'],
  ['Donation and Aid', '/donations'],
  ['Community', '/community'],
];

function subscribeSession(callback: () => void) {
  window.addEventListener('edrms-session', callback);
  return () => window.removeEventListener('edrms-session', callback);
}
function sessionSnapshot() { const token = sessionStorage.getItem('edrms-access-token'); return expiresAt(token) > Date.now() ? token : null; }
function updateSession(token?: string) {
  if (token) sessionStorage.setItem('edrms-access-token', token);
  else sessionStorage.removeItem('edrms-access-token');
  window.dispatchEvent(new Event('edrms-session'));
}
function expiresAt(token: string | null): number {
  try {
    const payload = JSON.parse(atob(token!.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : 0;
  } catch { return 0; }
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = useSyncExternalStore(subscribeSession, sessionSnapshot, () => null);
  const signedIn = !!token;
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => updateSession(), Math.max(0, Math.min(expiresAt(token) - Date.now(), 2147483647)));
    return () => window.clearTimeout(timer);
  }, [token]);
  return <header className="border-b bg-background">
    <div className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
      <Link href="/" className="w-fit text-xl font-bold tracking-tight">EDRMS</Link>
      <NavigationMenu aria-label="Main navigation" className="hidden lg:flex">
        <NavigationMenuList className="gap-2">
          {links.map(([label, href]) => <NavigationMenuItem key={href}><NavigationMenuLink render={<Link href={href} />} active={pathname === href} className="px-3 text-sm">{label}</NavigationMenuLink></NavigationMenuItem>)}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center justify-end gap-3">
        {signedIn ? <Avatar size="lg" aria-label="Signed in profile"><AvatarFallback><UserRound className="size-5" /></AvatarFallback></Avatar> : <AuthDialog onSignIn={updateSession} />}
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X /> : <Menu />}</Button>
      </div>
    </div>
    {mobileOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid gap-1 border-t p-3 lg:hidden">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:outline-ring">{label}</Link>)}</nav>}
  </header>;
}


