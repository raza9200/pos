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

    // Update the sale with payment information
    const sale = await prisma.sale.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        discount,
        total: finalTotal,
        status: "COMPLETED",
        notes: sale => `${sale.notes || ""}\nReceived: ₹${receivedAmount}${change > 0 ? ` | Change: ₹${change}` : ""}`
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
