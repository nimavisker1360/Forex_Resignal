import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeTradeChecklist } from "@/lib/checklists/api";
import { recalculateTradeChecklist } from "@/lib/checklists/trade-checklists";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; tradeChecklistId: string }>;
};

function optionalString(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  const text = String(value).trim();
  return text ? text : null;
}

function optionalBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function validationResponse(errors: string[]) {
  return NextResponse.json(
    { success: false, message: "Validation failed", errors },
    { status: 400 }
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id, tradeChecklistId } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (answers.length === 0) {
      return validationResponse(["answers must include at least one item"]);
    }

    const checklist = await prisma.$transaction(async (tx) => {
      const existing = await tx.tradeChecklist.findFirst({
        where: {
          id: tradeChecklistId,
          tradeId: id,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("Trade checklist not found");
      }

      for (const rawAnswer of answers) {
        const answer =
          rawAnswer && typeof rawAnswer === "object"
            ? (rawAnswer as Record<string, unknown>)
            : {};
        const answerId = optionalString(answer.id);

        if (!answerId) {
          continue;
        }

        const data: { checked?: boolean; note?: string | null } = {};

        if (answer.checked !== undefined) {
          data.checked = optionalBoolean(answer.checked, false);
        }

        if (answer.note !== undefined) {
          data.note = optionalString(answer.note);
        }

        if (Object.keys(data).length === 0) {
          continue;
        }

        await tx.tradeChecklistAnswer.updateMany({
          where: {
            id: answerId,
            tradeChecklistId,
          },
          data,
        });
      }

      return recalculateTradeChecklist(tx, tradeChecklistId);
    });

    return NextResponse.json({
      success: true,
      checklist: serializeTradeChecklist(checklist),
    });
  } catch (error) {
    console.error("Trade checklist PATCH error:", error);

    const message = error instanceof Error ? error.message : "";

    if (
      message === "Trade checklist not found" ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025")
    ) {
      return NextResponse.json(
        { success: false, message: "Trade checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update trade checklist" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id, tradeChecklistId } = await context.params;
    const deleted = await prisma.tradeChecklist.deleteMany({
      where: {
        id: tradeChecklistId,
        tradeId: id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { success: false, message: "Trade checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Trade checklist removed",
    });
  } catch (error) {
    console.error("Trade checklist DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to remove trade checklist" },
      { status: 500 }
    );
  }
}
