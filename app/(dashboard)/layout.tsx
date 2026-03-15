import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/sidebar/Sidebar";
import RightPanel from "@/components/sidebar/RightPanel";
import MobileNav from "@/components/sidebar/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileNav />
          <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
        </div>
        <RightPanel />
      </div>
    </SessionProvider>
  );
}
