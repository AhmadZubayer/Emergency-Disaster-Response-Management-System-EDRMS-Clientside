import { SidebarTrigger } from '@/components/ui/sidebar';

export default function UserHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <span className="font-semibold">EDRMS</span>
    </header>
  );
}