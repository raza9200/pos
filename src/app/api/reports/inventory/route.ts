import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/reports/inventory
export async function GET() {
  try {
    await requireAuth(["ADMIN", "MANAGER"])

    // Get all products with stock information
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: "asc",
      },
    })

    // Calculate inventory statistics
    const totalProducts = products.length
    const totalStockValue = products.reduce(
      (sum: number, product: any) => sum + Number(product.costPrice) * product.stock,
      0
    )
    const totalRetailValue = products.reduce(
      (sum: number, product: any) => sum + Number(product.price) * product.stock,
      0
    )

    // Low stock products
    const lowStockProducts = products.filter(
      (product: any) => product.stock <= product.minStock
    )

    // Out of stock products
    const outOfStockProducts = products.filter((product: any) => product.stock === 0)

    // Stock by category
    const stockByCategory = await prisma.product.groupBy({
      by: ["categoryId"],
      where: {
        isActive: true,
      },
      _sum: {
        stock: true,
      },
      _count: {
        id: true,
      },
    })

    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: stockByCategory.map((item: any) => item.categoryId),
        },
      },
    })

    const stockByCategoryWithNames = stockByCategory.map((item: any) => {
      const category = categories.find((c: any) => c.id === item.categoryId)
      return {
        category: category?.name || "Unknown",
        totalStock: item._sum.stock || 0,
        productCount: item._count.id,
      }
    })

    return NextResponse.json({
      summary: {
        totalProducts,
        totalStockValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalStockValue,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
      lowStockProducts: lowStockProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        minStock: p.minStock,
        category: p.category.name,
      })),
      outOfStockProducts: outOfStockProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category.name,
      })),
      stockByCategory: stockByCategoryWithNames,
    })
  } catch (error) {
    console.error("Error generating inventory report:", error)
    return NextResponse.json(
      { error: "Failed to generate inventory report" },
      { status: 500 }
    )
  }
}
