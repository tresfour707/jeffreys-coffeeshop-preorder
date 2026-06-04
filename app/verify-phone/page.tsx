import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { VerifyPhoneForm } from "@/components/auth/verify-phone-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VerifyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; demoCode?: string; purpose?: string; next?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (viewer?.phoneVerified) {
    redirect("/menu");
  }

  const params = await searchParams;
  const phone = typeof params.phone === "string" ? params.phone : "";
  const demoCode = typeof params.demoCode === "string" ? params.demoCode : "";
  const purpose = params.purpose === "LOGIN" ? "LOGIN" : "VERIFY";
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/") ? params.next : "/menu";

  if (!phone) {
    redirect("/sign-up");
  }

  return (
    <CustomerMobileShell viewer={null}>
      <VerifyPhoneForm
        phone={phone}
        demoCode={demoCode}
        purpose={purpose}
        nextPath={nextPath}
      />
    </CustomerMobileShell>
  );
}
