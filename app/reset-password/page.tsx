import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; code?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect("/menu");
  }

  const params = await searchParams;
  const phone = typeof params.phone === "string" ? params.phone : "";
  const code = typeof params.code === "string" ? params.code : "";

  if (!phone) {
    redirect("/forgot-password");
  }

  return (
    <CustomerMobileShell viewer={null}>
      <ResetPasswordForm phone={phone} demoCode={code} />
    </CustomerMobileShell>
  );
}
