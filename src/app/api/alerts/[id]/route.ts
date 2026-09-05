import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  product: z.string().min(2).max(200).optional(),
  category: z.string().min(1).max(64).optional(),
  targetPrice: z.number().positive().max(1_000_000).optional(),
  emailOn: z.boolean().optional(),
  pushOn: z.boolean().optional(),
  paused: z.boolean().optional(),
  currentPrice: z.number().optional().nullable(),
});

type Ctx = { params: Promise<{ id: string }> };

async function ownedAlert(userId: string, id: string) {
  return prisma.alert.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const alert = await ownedAlert(session.user.id, id);
  if (!alert) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  revalidatePath("/mis-alertas");
  return NextResponse.json(alert);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await ownedAlert(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const alert = await prisma.alert.update({
    where: { id },
    data: parsed.data,
  });
  revalidatePath("/mis-alertas");
  return NextResponse.json(alert);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const existing = await ownedAlert(session.user.id, id);
  if (!existing) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  await prisma.alert.delete({ where: { id } });
  revalidatePath("/mis-alertas");
  return NextResponse.json({ ok: true });
}
