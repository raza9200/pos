import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId, paymentMethod, discount, finalTotal, receivedAmount, change } = await request.json()

    if (!orderId || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get existing sale to preserve notes
    const existingSale = await prisma.sale.findUnique({
      where: { id: orderId }
    })

    if (!existingSale) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Build payment notes
    const paymentNotes = `Received: Rs ${receivedAmount.toFixed(2)}${change > 0 ? ` | Change: Rs ${change.toFixed(2)}` : ""}`
    const updatedNotes = existingSale.notes 
      ? `${existingSale.notes}\n${paymentNotes}` 
      : paymentNotes

    // Update the sale with payment information
    const sale = await prisma.sale.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        discount: discount || 0,
        total: finalTotal,
        status: "COMPLETED",
        notes: updatedNotes
      },
      include: {
        saleItems: {
          include: {
            product: true
          }
        },
        customer: true
      }
    })

    return NextResponse.json({
      message: "Payment processed successfully",
      sale: {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        total: sale.total,
        paymentMethod: sale.paymentMethod
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
