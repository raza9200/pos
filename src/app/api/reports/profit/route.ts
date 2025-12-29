import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/reports/profit
export async function GET(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "MANAGER"])

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter =
      startDate && endDate
        ? {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}

    // Get all sales in the period
    const sales = await prisma.sale.findMany({
      where: {
        ...dateFilter,
        status: "COMPLETED",
      },
      include: {
        saleItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calculate revenue and cost
    let totalRevenue = 0
    let totalCost = 0

    sales.forEach((sale: any) => {
      totalRevenue += Number(sale.total)
      sale.saleItems.forEach((item: any) => {
        totalCost += Number(item.product.costPrice) * item.quantity
      })
    })

    // Get total expenses
    const expenses = await prisma.expense.aggregate({
      where: {
        ...(startDate && endDate
          ? {
              expenseDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      _sum: {
        amount: true,
      },
    })

    const totalExpenses = Number(expenses._sum.amount || 0)

    // Calculate gross and net profit
    const grossProfit = totalRevenue - totalCost
    const netProfit = grossProfit - totalExpenses

    // Get expense breakdown by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        ...(startDate && endDate
          ? {
              expenseDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
      },
      _sum: {
        amount: true,
      },
    })

    // Profit by product
    const profitByProduct = sales.flatMap((sale: any) =>
      sale.saleItems.map((item: any) => ({
        productId: item.product.id,
        productName: item.product.name,
        revenue: Number(item.total),
        cost: Number(item.product.costPrice) * item.quantity,
        profit:
          Number(item.total) - Number(item.product.costPrice) * item.quantity,
        quantitySold: item.quantity,
      }))
    )

    // Aggregate profit by product
    const aggregatedProfitByProduct = profitByProduct.reduce(
      (acc: any, item: any) => {
        if (!acc[item.productId]) {
          acc[item.productId] = {
            productName: item.productName,
            revenue: 0,
            cost: 0,
            profit: 0,
            quantitySold: 0,
          }
        }
        acc[item.productId].revenue += item.revenue
        acc[item.productId].cost += item.cost
        acc[item.productId].profit += item.profit
        acc[item.productId].quantitySold += item.quantitySold
        return acc
      },
      {}
    )

    const topProfitableProducts = Object.values(aggregatedProfitByProduct)
      .sort((a: any, b: any) => b.profit - a.profit)
      .slice(0, 10)

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
        netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      },
      expensesByCategory,
      topProfitableProducts,
    })
  } catch (error) {
    console.error("Error generating profit report:", error)
    return NextResponse.json(
      { error: "Failed to generate profit report" },
      { status: 500 }
    )
  }
}
