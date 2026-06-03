import { NextResponse } from "next/server";

import { AppError } from "@/lib/app-error";
import { createSession, normalizePhone, verifyPassword } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = typeof body?.phone === "string" ? normalizePhone(body.phone) : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!phone || !password) {
      throw new AppError("Укажите телефон и пароль.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, name: true, phone: true, passwordHash: true },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new AppError("Неверный номер или пароль.", 401);
    }

    await createSession(user.id);

    return NextResponse.json({ id: user.id, name: user.name, phone: user.phone });
  } catch (error) {
    return toErrorResponse(error);
  }
}
