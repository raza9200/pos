import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/sales - Get all sales
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const sales = await prisma.sale.findMany({
      where: {
        ...(startDate && endDate
          ? {
              createdAt: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }
          : {}),
        // Cashiers can only see their own sales
        ...(session.user.role === "CASHIER"
          ? { userId: session.user.id }
          : {}),
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        saleItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    )
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(["ADMIN", "MANAGER", "CASHIER"])

    const body = await request.json()
    const { customerId, items, paymentMethod, discount, tax, notes } = body

    // Calculate totals
    let subtotal = 0
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice - (item.discount || 0)
    }

    const total = subtotal - (discount || 0) + (tax || 0)

    // Generate invoice number
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    })

    const lastInvoiceNumber = lastSale?.invoiceNumber || "INV-0000"
    const lastNumber = parseInt(lastInvoiceNumber.split("-")[1])
    const invoiceNumber = `INV-${String(lastNumber + 1).padStart(4, "0")}`

    // Create sale with transaction
    const sale = await prisma.$transaction(async (tx: any) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: customerId || null,
          userId: session.user.id,
          subtotal,
          discount: discount || 0,
          tax: tax || 0,
          total,
          paymentMethod,
          notes,
          saleItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              total: item.quantity * item.unitPrice - (item.discount || 0),
            })),
          },
        },
        include: {
          customer: true,
          saleItems: {
            include: {
              product: true,
            },
          },
        },
      })

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Update customer loyalty points if applicable
      if (customerId) {
        const pointsEarned = Math.floor(total)
        await tx.customer.update({
          where: { id: customerId },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    )
  }
}
