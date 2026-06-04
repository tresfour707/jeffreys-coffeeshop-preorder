import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { hashPassword, normalizePhone } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : "";
    const code = typeof body?.code === "string" ? body.code.trim() : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

    if (!phone || !code) {
      throw new AppError("Укажите телефон и код.", 400);
    }

    if (newPassword.length < 6) {
      throw new AppError("Пароль должен быть не короче 6 символов.", 400);
    }

    const otp = await prisma.otpCode.findFirst({
      where: { phone, code, purpose: "RESET" },
    });

    if (!otp) {
      throw new AppError("Неверный код.", 400);
    }

    if (otp.expiresAt.getTime() <= Date.now()) {
      await prisma.otpCode.delete({ where: { id: otp.id } });
      throw new AppError("Код истёк. Запросите новый.", 400);
    }

    await prisma.user.update({
      where: { phone },
      data: { passwordHash: hashPassword(newPassword) },
    });

    await prisma.otpCode.delete({ where: { id: otp.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
