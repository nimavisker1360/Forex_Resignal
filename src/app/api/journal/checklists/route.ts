import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  checklistTemplateInclude,
  normalizeTemplatePayload,
  serializeChecklistTemplate,
} from "@/lib/checklists/api";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATES = [
  {
    title: "Pre Trade Checklist",
    description: "Core checks before entering a trade.",
    category: "Pre Trade",
    isDefault: true,
    items: [
      "Trend direction is clear",
      "Setup matches my strategy",
      "Entry level is valid",
      "Stop Loss is defined",
      "Take Profit is defined",
      "Risk/Reward is at least 1:2",
      "Lot size is calculated correctly",
      "No high-impact news nearby",
      "I am not entering because of FOMO",
      "I accept the risk before entering",
    ],
  },
  {
    title: "Risk Management Checklist",
    description: "Position sizing and account protection checks.",
    category: "Risk Management",
    isDefault: false,
    items: [
      "Risk per trade is within my limit",
      "Daily loss limit is not reached",
      "No over-leveraging",
      "Stop Loss is placed before entry",
      "Trade does not violate my plan",
    ],
  },
  {
    title: "Psychology Checklist",
    description: "Mental state review before and during execution.",
    category: "Psychology",
    isDefault: false,
    items: [
      "I feel calm",
      "I am not revenge trading",
      "I am not chasing the market",
      "I can accept a loss",
      "This trade follows my plan",
    ],
  },
];

function validationResponse(errors: string[]) {
  return NextResponse.json(
    { success: false, message: "Validation failed", errors },
    { status: 400 }
  );
}

async function seedDefaultTemplatesIfEmpty() {
  const count = await prisma.checklistTemplate.count();

  if (count > 0) {
    return;
  }

  await prisma.$transaction(
    DEFAULT_TEMPLATES.map((template) =>
      prisma.checklistTemplate.create({
        data: {
          title: template.title,
          description: template.description,
          category: template.category,
          isDefault: template.isDefault,
          items: {
            create: template.items.map((title, index) => ({
              title,
              isRequired: index < 5,
              sortOrder: index,
            })),
          },
        },
      })
    )
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    await seedDefaultTemplatesIfEmpty();

    const templates = await prisma.checklistTemplate.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: checklistTemplateInclude,
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({
      success: true,
      checklists: templates.map(serializeChecklistTemplate),
    });
  } catch (error) {
    console.error("Checklist templates GET error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load checklist templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const normalized = normalizeTemplatePayload(body);
    const title = normalized.data.title;

    if (normalized.errors.length > 0 || !title) {
      return validationResponse(normalized.errors);
    }

    const template = await prisma.$transaction(async (tx) => {
      if (normalized.data.isDefault) {
        await tx.checklistTemplate.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.checklistTemplate.create({
        data: {
          title,
          description: normalized.data.description,
          category: normalized.data.category,
          isActive: normalized.data.isActive,
          isDefault: normalized.data.isDefault,
          items: {
            create: normalized.data.items.map((item, index) => ({
              title: item.title,
              description: item.description,
              isRequired: item.isRequired,
              sortOrder: item.sortOrder ?? index,
            })),
          },
        },
        include: checklistTemplateInclude,
      });
    });

    return NextResponse.json(
      {
        success: true,
        checklist: serializeChecklistTemplate(template),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checklist templates POST error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return validationResponse(["Checklist relation is invalid"]);
    }

    return NextResponse.json(
      { success: false, message: "Failed to create checklist template" },
      { status: 500 }
    );
  }
}
