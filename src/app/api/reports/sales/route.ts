import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/reports/sales
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

    // Get sales summary
    const salesSummary = await prisma.sale.aggregate({
      where: {
        ...dateFilter,
        status: "COMPLETED",
      },
      _sum: {
        total: true,
        subtotal: true,
        discount: true,
        tax: true,
      },
      _count: {
        id: true,
      },
    })

    // Get sales by payment method
    const salesByPaymentMethod = await prisma.sale.groupBy({
      by: ["paymentMethod"],
      where: {
        ...dateFilter,
        status: "COMPLETED",
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    })

    // Get top selling products
    const topProducts = await prisma.saleItem.groupBy({
      by: ["productId"],
      where: {
        sale: dateFilter,
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    })

    // Get product details for top products
    const productIds = topProducts.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
      },
    })

    const topProductsWithDetails = topProducts.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId)
      return {
        product,
        quantitySold: item._sum.quantity,
        revenue: item._sum.total,
      }
    })

    // Get daily sales for the period
    const sales = await prisma.sale.findMany({
      where: {
        ...dateFilter,
        status: "COMPLETED",
      },
      select: {
        createdAt: true,
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group by day
    const dailySales = sales.reduce((acc: any, sale: any) => {
      const date = sale.createdAt.toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 }
      }
      acc[date].total += Number(sale.total)
      acc[date].count += 1
      return acc
    }, {})

    return NextResponse.json({
      summary: {
        totalSales: salesSummary._sum.total || 0,
        totalTransactions: salesSummary._count.id || 0,
        totalDiscount: salesSummary._sum.discount || 0,
        totalTax: salesSummary._sum.tax || 0,
        averageTransaction:
          salesSummary._count.id > 0
            ? Number(salesSummary._sum.total) / salesSummary._count.id
            : 0,
      },
      salesByPaymentMethod,
      topProducts: topProductsWithDetails,
      dailySales: Object.values(dailySales),
    })
  } catch (error) {
    console.error("Error generating sales report:", error)
    return NextResponse.json(
      { error: "Failed to generate sales report" },
      { status: 500 }
    )
  }
}
