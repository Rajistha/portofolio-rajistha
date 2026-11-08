import type { Metadata } from "next";
import { getShortLinks } from "@/lib/actions/links";
import { LinksTable } from "@/components/admin/links-table";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Short Links",
};

export default async function AdminLinksPage() {
  const links = await getShortLinks(false);

  return <LinksTable initialLinks={links} />;
}
