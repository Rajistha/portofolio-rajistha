import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getUnreadSummary } from "@/lib/admin-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const unread = await getUnreadSummary();

  return (
    <div className="flex min-h-screen flex-col bg-background sm:flex-row">
      <AdminSidebar userEmail={user?.email} signOut={signOut} unread={unread} />

      <main className="min-w-0 flex-1 p-4 sm:ml-64 sm:p-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
