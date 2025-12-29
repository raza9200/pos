"use client"

import { useState, useEffect } from "react"

type OrderItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

type Order = {
  id: string
  invoiceNumber: string
  tableNumber?: string
  customerName?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: string
  notes?: string
  createdAt: string
}

export default function BillingManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "UPI">("CASH")
  const [discount, setDiscount] = useState(0)
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedBill, setCompletedBill] = useState<Order | null>(null)

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      // Filter for served orders that need billing
      const pendingBills = data.filter((order: Order) => 
        order.status === "SERVED" || order.status === "READY"
      )
      setOrders(pendingBills)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectOrder = (order: Order) => {
    setSelectedOrder(order)
    setReceivedAmount(order.total - discount)
  }

  const calculateFinalTotal = () => {
    if (!selectedOrder) return 0
    return selectedOrder.total - discount
  }

  const calculateChange = () => {
    return Math.max(0, receivedAmount - calculateFinalTotal())
  }

  const processBill = async () => {
    if (!selectedOrder) return

    const finalTotal = calculateFinalTotal()

    if (paymentMethod === "CASH" && receivedAmount < finalTotal) {
      alert("Received amount is less than total")
      return
    }

    try {
      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          paymentMethod,
          discount,
          finalTotal,
          receivedAmount: paymentMethod === "CASH" ? receivedAmount : finalTotal,
          change: paymentMethod === "CASH" ? calculateChange() : 0
        })
      })

      if (response.ok) {
        const result = await response.json()
        setCompletedBill({
          ...selectedOrder,
          total: finalTotal
        })
        setShowReceipt(true)
        
        // Reset form
        setSelectedOrder(null)
        setDiscount(0)
        setReceivedAmount(0)
        setPaymentMethod("CASH")
        fetchPendingOrders()
      } else {
        alert("Failed to process payment")
      }
    } catch (error) {
      console.error("Error processing bill:", error)
      alert("Error processing payment")
    }
  }

  const printReceipt = () => {
    window.print()
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Billing & Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Bills</h2>
            
            {orders.length === 0 ? (
              <p className="text-gray-500">No pending bills</p>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedOrder?.id === order.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.invoiceNumber}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">Rs {order.total.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Billing Details */}
        <div className="lg:col-span-2">
          {!selectedOrder ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl text-gray-500">Select an order to process billing</h3>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.invoiceNumber}</h2>
                    {selectedOrder.tableNumber && (
                      <p className="text-gray-600">Table {selectedOrder.tableNumber}</p>
                    )}
                    {selectedOrder.customerName && (
                      <p className="text-gray-600">{selectedOrder.customerName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">Rs {item.unitPrice.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900">Rs {item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t pt-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(["CASH", "CARD", "UPI"] as const).map(method => (
                          <button
                            key={method}
                            onClick={() => setPaymentMethod(method)}
                            className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                              paymentMethod === method
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-300 text-gray-700 hover:border-orange-300"
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount (Rs )</label>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>

                    {paymentMethod === "CASH" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Received Amount (Rs )</label>
                        <input
                          type="number"
                          value={receivedAmount}
                          onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                          placeholder="0.00"
                          min="0"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">Rs {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax</span>
                      <span className="font-medium">Rs {selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount</span>
                        <span className="font-medium">-Rs {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-2xl font-bold text-gray-900 border-t border-orange-200 pt-3">
                      <span>Total</span>
                      <span className="text-orange-600">Rs {calculateFinalTotal().toFixed(2)}</span>
                    </div>
                    {paymentMethod === "CASH" && receivedAmount > 0 && (
                      <>
                        <div className="flex justify-between text-gray-700 pt-2">
                          <span>Received</span>
                          <span className="font-medium">Rs {receivedAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-emerald-700">
                          <span>Change</span>
                          <span>Rs {calculateChange().toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={processBill}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg"
                >
                  Complete Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900 text-center">Payment Successful!</h2>
            </div>

            <div className="p-6 print:p-8">
              {/* Receipt Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">RestaurantPro</h3>
                <p className="text-sm text-gray-600">Restaurant Management System</p>
                <p className="text-xs text-gray-500 mt-2">{new Date().toLocaleString()}</p>
              </div>

              <div className="border-t border-b py-4 mb-4">
                <p className="font-bold text-gray-900">Invoice: {completedBill.invoiceNumber}</p>
                {completedBill.tableNumber && (
                  <p className="text-gray-600">Table: {completedBill.tableNumber}</p>
                )}
                {completedBill.customerName && (
                  <p className="text-gray-600">Customer: {completedBill.customerName}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {completedBill.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                    <span className="text-gray-900 font-medium">Rs {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>Rs {completedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax</span>
                  <span>Rs {completedBill.tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Discount</span>
                    <span>-Rs {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total Paid</span>
                  <span className="text-orange-600">Rs {completedBill.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Payment Method</span>
                  <span>{paymentMethod}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Thank you for dining with us!
              </p>
            </div>

            <div className="p-6 border-t flex gap-3 print:hidden">
              <button
                onClick={printReceipt}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Print Receipt
              </button>
              <button
                onClick={() => {
                  setShowReceipt(false)
                  setCompletedBill(null)
                }}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
