import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { createSession, normalizePhone } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!phone || !code) {
      throw new AppError("Укажите телефон и код.", 400);
    }

    // Check OTP for either purpose (VERIFY = sign-up, LOGIN = sign-in)
    const otp = await prisma.otpCode.findFirst({
      where: { phone, code, purpose: { in: ["VERIFY", "LOGIN"] } },
    });

    if (!otp) {
      throw new AppError("Неверный код.", 400);
    }

    if (otp.expiresAt.getTime() <= Date.now()) {
      await prisma.otpCode.delete({ where: { id: otp.id } });
      throw new AppError("Код истёк. Запросите новый.", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    // User exists (sign-in flow) — consume OTP and create session
    if (existingUser) {
      await prisma.otpCode.delete({ where: { id: otp.id } });
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { phoneVerified: true },
      });
      await createSession(existingUser.id);
      return NextResponse.json({ ok: true });
    }

    // New user (sign-up flow) — need a name to complete registration
    if (!name || name.length < 2) {
      // OTP is valid but we still need a name — don't consume it yet
      return NextResponse.json({ needsName: true });
    }

    // Name provided — consume OTP, create user and session
    await prisma.otpCode.delete({ where: { id: otp.id } });

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        phoneVerified: true,
      },
      select: { id: true },
    });

    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
