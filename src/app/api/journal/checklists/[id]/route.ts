import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checklistTemplateInclude,
  normalizeTemplatePayload,
  serializeChecklistTemplate,
} from "@/lib/checklists/api";
import { getCurrentUserId, unauthorizedResponse } from "@/lib/server-auth";
import { requireFeatureAccess, subscriptionAccessResponse } from "@/lib/subscription";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function validationResponse(errors: string[]) {
  return NextResponse.json(
    { success: false, message: "Validation failed", errors },
    { status: 400 }
  );
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const template = await prisma.checklistTemplate.findUnique({
      where: { id },
      include: checklistTemplateInclude,
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: "Checklist template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      checklist: serializeChecklistTemplate(template),
    });
  } catch (error) {
    console.error("Checklist template GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load checklist template" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    await requireFeatureAccess(userId, "checklists");

    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;
    const normalized = normalizeTemplatePayload(body, { partial: true });

    if (normalized.errors.length > 0) {
      return validationResponse(normalized.errors);
    }

    const template = await prisma.$transaction(async (tx) => {
      const existing = await tx.checklistTemplate.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("Checklist template not found");
      }

      if (body.isDefault !== undefined && normalized.data.isDefault) {
        await tx.checklistTemplate.updateMany({
          where: { id: { not: id }, isDefault: true },
          data: { isDefault: false },
        });
      }

      await tx.checklistTemplate.update({
        where: { id },
        data: {
          ...(body.title !== undefined && normalized.data.title
            ? { title: normalized.data.title }
            : {}),
          ...(body.description !== undefined
            ? { description: normalized.data.description }
            : {}),
          ...(body.category !== undefined
            ? { category: normalized.data.category }
            : {}),
          ...(body.isActive !== undefined
            ? { isActive: normalized.data.isActive }
            : {}),
          ...(body.isDefault !== undefined
            ? { isDefault: normalized.data.isDefault }
            : {}),
        },
      });

      if (body.items !== undefined) {
        await tx.checklistItem.deleteMany({
          where: { checklistId: id },
        });
        await tx.checklistItem.createMany({
          data: normalized.data.items.map((item, index) => ({
            checklistId: id,
            title: item.title,
            description: item.description,
            isRequired: item.isRequired,
            sortOrder: item.sortOrder ?? index,
          })),
        });
      }

      return tx.checklistTemplate.findUniqueOrThrow({
        where: { id },
        include: checklistTemplateInclude,
      });
    });

    return NextResponse.json({
      success: true,
      checklist: serializeChecklistTemplate(template),
    });
  } catch (error) {
    const accessResponse = subscriptionAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Checklist template PATCH error:", error);

    const message = error instanceof Error ? error.message : "";

    if (
      message === "Checklist template not found" ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025")
    ) {
      return NextResponse.json(
        { success: false, message: "Checklist template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to update checklist template" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    await requireFeatureAccess(userId, "checklists");

    const { id } = await context.params;
    const result = await prisma.$transaction(async (tx) => {
      const usedCount = await tx.tradeChecklist.count({
        where: { checklistTemplateId: id },
      });

      if (usedCount > 0) {
        const template = await tx.checklistTemplate.update({
          where: { id },
          data: { isActive: false },
          include: checklistTemplateInclude,
        });

        return {
          mode: "disabled" as const,
          template,
        };
      }

      await tx.checklistTemplate.delete({
        where: { id },
      });

      return {
        mode: "deleted" as const,
        template: null,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        result.mode === "disabled"
          ? "Checklist template disabled because it is used in trades"
          : "Checklist template deleted",
      checklist: result.template
        ? serializeChecklistTemplate(result.template)
        : null,
    });
  } catch (error) {
    const accessResponse = subscriptionAccessResponse(error);

    if (accessResponse) {
      return accessResponse;
    }

    console.error("Checklist template DELETE error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, message: "Checklist template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to delete checklist template" },
      { status: 500 }
    );
  }
}
