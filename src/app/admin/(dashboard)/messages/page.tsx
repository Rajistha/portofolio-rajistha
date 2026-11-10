import type { Metadata } from "next";
import { getMessages } from "@/lib/admin-data";
import { MessagesInbox } from "@/components/admin/messages-inbox";

export const revalidate = 0;

export const metadata: Metadata = { title: "Pesan" };

export default async function AdminMessagesPage() {
  const messages = await getMessages();
  return <MessagesInbox initialMessages={messages} />;
}
