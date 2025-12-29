import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const categoryId = searchParams.get("categoryId")

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search } },
                  { sku: { contains: search } },
                  { barcode: { contains: search } },
                ],
              }
            : {},
          categoryId ? { categoryId } : {},
          { isActive: true },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    await requireAuth(["ADMIN", "MANAGER"])

    const body = await request.json()
    const {
      name,
      description,
      sku,
      barcode,
      price,
      costPrice,
      stock,
      minStock,
      categoryId,
      imageUrl,
    } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        sku,
        barcode,
        price,
        costPrice,
        stock,
        minStock: minStock || 10,
        categoryId,
        imageUrl,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
