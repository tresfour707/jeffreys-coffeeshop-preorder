import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect("/menu");
  }

  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/menu";

  return (
    <CustomerMobileShell viewer={null}>
      <SignUpForm nextPath={nextPath} />
    </CustomerMobileShell>
  );
}
