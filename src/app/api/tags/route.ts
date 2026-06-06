import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/journal/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // TODO: Replace query-param userId with the authenticated session user id.
    const userId = searchParams.get("userId");

    if (!userId) {
      return apiResponse({ success: false, message: "userId is required" }, 400);
    }

    const db = prisma as any;
    const tags = await db.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return apiResponse({ success: true, data: tags });
  } catch (error) {
    console.error("Tags GET error:", error);

    return apiResponse({ success: false, message: "Failed to load tags" }, 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // TODO: Replace body userId with the authenticated session user id.
    const { userId, name, color } = body;

    if (!userId || !name) {
      return apiResponse(
        { success: false, message: "userId and name are required" },
        400
      );
    }

    const db = prisma as any;
    const tag = await db.tag.create({
      data: {
        userId,
        name: String(name).trim(),
        color,
      },
    });

    return apiResponse({ success: true, data: tag }, 201);
  } catch (error) {
    console.error("Tags POST error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiResponse({ success: false, message: "Tag already exists" }, 409);
    }

    return apiResponse({ success: false, message: "Failed to create tag" }, 500);
  }
}
