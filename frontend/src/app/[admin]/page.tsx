import { redirect } from "next/navigation";

export default function AdminIndex() {
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || "admin";
  redirect(`/${adminPath}/dashboard`);
}
