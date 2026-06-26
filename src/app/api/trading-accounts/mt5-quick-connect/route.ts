import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authErrorResponse, requireUser } from "@/lib/server-auth";
import { getMt5JournalApiUrl } from "@/server/mt5/config";
import {
  generateJournalSecret,
  hashJournalSecret,
} from "@/server/mt5/hash-journal-secret";
import {
  assertUserCanUseJournal,
  JournalSubscriptionError,
} from "@/server/mt5/subscription-service";

export const dynamic = "force-dynamic";

const QUICK_CONNECT_ACCOUNT_NAME = "MT5 Auto Connect";

export async function POST() {
  try {
    const user = await requireUser();

    await assertUserCanUseJournal(user.id);

    const secret = generateJournalSecret();

    const account = await prisma.tradingAccount.create({
      data: {
        userId: user.id,
        name: QUICK_CONNECT_ACCOUNT_NAME,
        broker: null,
        platform: "MT5",
        currency: "USD",
        journalEnabled: true,
        journalSecretHash: hashJournalSecret(secret),
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        account,
        secret,
        apiUrl: getMt5JournalApiUrl(),
      },
      { status: 201 }
    );
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

    console.error("MT5 quick connect error:", error);

    return NextResponse.json(
      { ok: false, error: "Failed to create MT5 quick connection" },
      { status: 500 }
    );
  }
}
