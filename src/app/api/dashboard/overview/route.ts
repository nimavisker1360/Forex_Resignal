import { getDashboardOverviewData } from "@/lib/dashboard-data";
import { apiResponse } from "@/lib/journal/api-utils";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const data = await getDashboardOverviewData(userId);

    return apiResponse({ success: true, data });
  } catch (error) {
    console.error("Dashboard overview GET error:", error);

    return apiResponse(
      { success: false, message: "Failed to load dashboard overview" },
      500
    );
  }
}
