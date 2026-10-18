import { AutoRefresh } from "@/components/auto-refresh";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { requireUser } from "@/lib/data";
import { SidebarNav, BottomNav } from "@/components/nav-links";
import { LogoutButton } from "@/components/logout-button";
import { UserAvatar } from "@/components/user-avatar";
import { Logo } from "@/components/logo";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-mist md:flex md:p-3">
      <aside className="sticky top-3 hidden h-[calc(100vh-1.5rem)] w-60 shrink-0 flex-col rounded-3xl bg-gradient-to-b from-[#0d2d5e] to-[#081b3f] p-4 text-white shadow-xl md:flex">
        <div className="mb-8 px-2 pt-1"><Logo light /></div>
        <SidebarNav />
        <LogoutButton />
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0 md:pl-8">
        <header className="flex items-center justify-between px-4 py-4 md:justify-end md:px-2">
          <span className="md:hidden"><Logo /></span>
          <Link href="/profile" className="flex items-center gap-2">
            <UserAvatar name={user.name} avatar={user.avatar} size={36} />
            <span className="hidden text-sm font-semibold text-ink sm:inline">{user.name}</span>
            <ChevronDown size={16} className="text-blue-600" />
          </Link>
        </header>
        <main className="mx-auto max-w-6xl px-4 pb-8 md:px-2">{children}</main>
      </div>
      <AutoRefresh /><BottomNav />
    </div>
  );
}


