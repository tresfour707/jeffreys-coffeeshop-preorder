import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { createDemoPayment } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const viewer = await requireCurrentUser();
    const body = await request.json().catch(() => null);
    const bonusToUse = typeof body?.bonusToUse === "number" ? Math.floor(body.bonusToUse) : 0;

    const payment = await createDemoPayment({
      userId: viewer.id,
      customerName: viewer.name,
      customerEmail: viewer.email ?? null,
      method: body?.method === "DEMO_SBP" ? "DEMO_SBP" : "DEMO_CARD",
      items: Array.isArray(body?.items) ? body.items : [],
      bonusToUse,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
