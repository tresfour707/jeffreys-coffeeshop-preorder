import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { generateOtpCode, normalizePhone } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const OTP_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : "";

    if (!phone) {
      throw new AppError("Укажите телефон.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, phoneVerified: true },
    });

    if (!user) {
      throw new AppError("Аккаунт не найден.", 404);
    }

    if (user.phoneVerified) {
      throw new AppError("Номер уже подтверждён.", 400);
    }

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.otpCode.deleteMany({ where: { phone, purpose: "VERIFY" } });
    await prisma.otpCode.create({
      data: { phone, code, purpose: "VERIFY", expiresAt },
    });

    return NextResponse.json({ demoCode: code });
  } catch (error) {
    return toErrorResponse(error);
  }
}
