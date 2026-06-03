import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { VerifyPhoneForm } from "@/components/auth/verify-phone-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; code?: string; next?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (viewer?.phoneVerified) {
    redirect("/menu");
  }

  const params = await searchParams;
  const phone = typeof params.phone === "string" ? params.phone : "";
  const code = typeof params.code === "string" ? params.code : "";
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/menu";

  if (!phone) {
    redirect("/sign-up");
  }

  return (
    <CustomerMobileShell viewer={null}>
      <VerifyPhoneForm phone={phone} demoCode={code} nextPath={nextPath} />
    </CustomerMobileShell>
  );
}
