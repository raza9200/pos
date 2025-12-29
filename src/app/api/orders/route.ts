import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sales = await prisma.sale.findMany({
      include: {
        saleItems: {
          include: {
            product: true
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Transform sales to orders format
    const orders = sales.map(sale => ({
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      tableNumber: sale.notes?.match(/Table (\d+)/)?.[1] || undefined,
      customerName: sale.customer?.name || undefined,
      items: sale.saleItems.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
      status: sale.status,
      notes: sale.notes,
      createdAt: sale.createdAt.toISOString()
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tableNumber, customerName, items, subtotal, tax, total, notes, status } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 })
    }

    // Generate invoice number
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: "desc" }
    })
    const lastInvoiceNum = lastSale?.invoiceNumber ? parseInt(lastSale.invoiceNumber.replace("INV-", "")) : 0
    const invoiceNumber = `INV-${String(lastInvoiceNum + 1).padStart(6, "0")}`

    // Combine table and notes
    const fullNotes = tableNumber 
      ? `Table ${tableNumber}${notes ? ` - ${notes}` : ""}`
      : notes || ""

    // Create sale with items
    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        userId: session.user.id,
        subtotal,
        tax,
        total,
        paymentMethod: "PENDING",
        status: status || "PENDING",
        notes: fullNotes,
        saleItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
        }
      },
      include: {
        saleItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return NextResponse.json({
      message: "Order created successfully",
      order: {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        total: sale.total
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
