import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect("/menu");
  }

  return (
    <CustomerMobileShell viewer={null}>
      <ForgotPasswordForm />
    </CustomerMobileShell>
  );
}
