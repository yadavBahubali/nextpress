import { redirect } from "next/navigation";

export default async function AppearancePage({
  params,
}: {
  params: Promise<{ admin: string }>;
}) {
  const awaitedParams = await params;
  const adminPath = awaitedParams.admin || "admin";
  redirect(`/${adminPath}/appearance/menus`);
}
