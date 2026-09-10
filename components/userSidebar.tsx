'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  HandHeart,
  HeartHandshake,
  House,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Search,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navLinks = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'My Rescue Requests',
    href: '/rescue-requests',
    icon: LifeBuoy,
  },
  {
    title: 'Missing Persons',
    href: '/missing-persons',
    icon: Search,
  },
  { title: 'Find Shelter', href: '/shelters', icon: House },
  { title: 'Community', href: '/community', icon: MessageSquare },
  {
    title: 'Donations & Aid',
    href: '/donations',
    icon: HandHeart,
  },
  {
    title: 'Relief Organizations',
    href: '/relief-organizations',
    icon: Building2,
  },
  {
    title: 'Get Involved',
    href: '/get-involved',
    icon: HeartHandshake,
  },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b px-4 py-5">
        <span className="text-lg font-bold">EDRMS</span>
        <p className="text-xs text-muted-foreground">
          Emergency & Disaster Response
        </p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map(({ title, href, icon: Icon }) => {
                const active =
                  pathname === href ||
                  pathname.startsWith(`${href}/`);

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      isActive={active}
                      render={
                        <Link
                          href={href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setOpenMobile(false)}
                        />
                      }
                    >
                      <Icon />
                      <span>{title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}