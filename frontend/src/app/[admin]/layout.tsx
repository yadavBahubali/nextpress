import { notFound } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextPress Admin",
  description: "NextPress Content Management System",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest'
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ admin: string }>;
}) {
  const { admin } = await params;

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";

  if (admin !== adminPath) {
    notFound();
  }

  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}