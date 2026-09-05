import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  product: z.string().min(2).max(200),
  category: z.string().min(1).max(64),
  targetPrice: z.number().positive().max(1_000_000),
  emailOn: z.boolean().optional().default(true),
  pushOn: z.boolean().optional().default(false),
  paused: z.boolean().optional().default(false),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(alerts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const alert = await prisma.alert.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
    },
  });
  revalidatePath("/mis-alertas");
  return NextResponse.json(alert, { status: 201 });
}
