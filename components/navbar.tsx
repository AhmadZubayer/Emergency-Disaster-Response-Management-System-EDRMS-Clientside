'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, UserRound, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { useAuth } from '@/app/hooks/useAuth';

const links = [
  ['Dashboard', '/dashboard'],
  ['Missing Persons', '/missing-persons'],
  ['Rescue Requests', '/rescue-requests'],
  ['Donations', '/donations'],
  ['Community', '/community'],
];

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logOut } = useAuth();

  return (
    <header className="border-b bg-background">
      <div className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="w-fit text-xl font-bold tracking-tight">
          EDRMS
        </Link>
        <NavigationMenu aria-label="Main navigation" className="hidden lg:flex">
          <NavigationMenuList className="gap-2">
            {links.map(([label, href]) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink
                  render={<Link href={href} />}
                  active={pathname === href}
                  className="px-3 text-sm"
                >
                  {label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center justify-end gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold">{user.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{user.role || 'user'}</span>
              </div>
              <Avatar size="default" aria-label="Signed in profile">
                <AvatarFallback>
                  <UserRound className="size-4" />
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logOut()}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button
              render={<Link href="/sign-in" />}
              size="lg"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium"
            >
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid gap-1 border-t p-3 lg:hidden">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm hover:bg-muted focus-visible:outline-ring"
            >
              {label}
            </Link>
          ))}
          <div className="pt-2">
            {user ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-center text-sm font-medium text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setMobileOpen(false);
                  logOut();
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                render={<Link href="/sign-in" />}
                size="lg"
                className="w-full justify-center text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;



