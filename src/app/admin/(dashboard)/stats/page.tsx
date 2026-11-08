import type { Metadata } from "next";
import { getStats } from "@/lib/data";
import { StatsManager } from "@/components/admin/stats-manager";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Statistik",
};

export default async function AdminStatsPage() {
  const stats = await getStats();

  return <StatsManager initialStats={stats} />;
}
