import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "BRAND") {
    return NextResponse.json({ offers: store.listOffersForBrand(session.user.id) });
  }

  return NextResponse.json({ offers: store.listOffersForCreator(session.user.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.creatorProfileId || !body.title || !body.budgetPkr) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const offer = store.createOffer({
    brandUserId: session.user.id,
    creatorProfileId: body.creatorProfileId,
    title: body.title,
    description: body.description ?? "",
    deliverables: body.deliverables ?? [],
    budgetPkr: Number(body.budgetPkr),
    deadline: body.deadline ?? null,
  });

  if (!offer) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  return NextResponse.json({ offer });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = store.updateOffer(body.id, session.user.id, {
    status: body.status,
    counterBudgetPkr: body.counterBudgetPkr,
    counterMessage: body.counterMessage,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ offer: result.offer });
}
