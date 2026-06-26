import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/server-auth";
import { getMt5JournalApiUrl } from "@/server/mt5/config";
import {
  assertUserCanUseJournal,
  JournalSubscriptionError,
} from "@/server/mt5/subscription-service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchSchema = z.object({
  journalEnabled: z.boolean().optional(),
  mt5AccountNumber: z
    .preprocess((value) => {
      if (value === undefined || value === null) {
        return undefined;
      }

      const text = String(value).trim();
      return text || null;
    }, z.string().nullable().optional()),
});

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function serializeConfig(account: {
  id: string;
  name: string;
  mt5AccountNumber: string | null;
  journalEnabled: boolean;
  journalSecretHash: string | null;
  lastConnectedAt: Date | null;
  lastSyncAt: Date | null;
}) {
  return {
    apiUrl: getMt5JournalApiUrl(),
    journalEnabled: account.journalEnabled,
    hasSecret: Boolean(account.journalSecretHash),
    account: {
      id: account.id,
      name: account.name,
      mt5AccountNumber: account.mt5AccountNumber,
    },
    lastConnectedAt: serializeDate(account.lastConnectedAt),
    lastSyncAt: serializeDate(account.lastSyncAt),
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const account = await prisma.tradingAccount.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        name: true,
        mt5AccountNumber: true,
        journalEnabled: true,
        journalSecretHash: true,
        lastConnectedAt: true,
        lastSyncAt: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { ok: false, error: "Trading account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      ...serializeConfig(account),
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    console.error("Journal config GET error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to load journal config" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const parsed = patchSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid payload",
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const existing = await prisma.tradingAccount.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Trading account not found" },
        { status: 404 }
      );
    }

    if (parsed.data.journalEnabled === true) {
      await assertUserCanUseJournal(user.id);
    }

    const account = await prisma.tradingAccount.update({
      where: { id },
      data: {
        ...(parsed.data.journalEnabled !== undefined
          ? { journalEnabled: parsed.data.journalEnabled }
          : {}),
        ...(parsed.data.mt5AccountNumber !== undefined
          ? { mt5AccountNumber: parsed.data.mt5AccountNumber }
          : {}),
      },
      select: {
        id: true,
        name: true,
        mt5AccountNumber: true,
        journalEnabled: true,
        journalSecretHash: true,
        lastConnectedAt: true,
        lastSyncAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      ...serializeConfig(account),
    });
  } catch (error) {
    const authResponse = authErrorResponse(error);

    if (authResponse) {
      return authResponse;
    }

    if (error instanceof JournalSubscriptionError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }

    console.error("Journal config PATCH error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to update journal config" },
      { status: 500 }
    );
  }
}
