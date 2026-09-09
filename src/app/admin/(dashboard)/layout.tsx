import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background sm:flex-row">
      <AdminSidebar userEmail={user?.email} signOut={signOut} />

      <main className="flex-1 p-4 sm:p-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
