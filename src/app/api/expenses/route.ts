import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/expenses
export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "MANAGER"])

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    const expenses = await prisma.expense.findMany({
      where: {
        AND: [
          startDate && endDate
            ? {
                expenseDate: {
                  gte: new Date(startDate),
                  lte: new Date(endDate),
                },
              }
            : {},
          category ? { category: category as any } : {},
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        expenseDate: "desc",
      },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    )
  }
}

// POST /api/expenses
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "MANAGER"])

    const body = await request.json()
    const { description, amount, category, notes, expenseDate } = body

    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        category,
        notes,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}
