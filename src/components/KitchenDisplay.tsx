"use client"

import { useState, useEffect } from "react"

type OrderItem = {
  id: string
  productName: string
  quantity: number
}

type KitchenOrder = {
  id: string
  invoiceNumber: string
  tableNumber?: string
  items: OrderItem[]
  status: "PENDING" | "PREPARING" | "READY"
  notes?: string
  createdAt: string
  elapsedTime: number
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKitchenOrders()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchKitchenOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      
      // Filter orders that need kitchen attention
      const kitchenOrders = data
        .filter((order: any) => ["PENDING", "PREPARING", "READY"].includes(order.status))
        .map((order: any) => ({
          ...order,
          elapsedTime: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
        }))
      
      setOrders(kitchenOrders)
    } catch (error) {
      console.error("Error fetching kitchen orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: KitchenOrder["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchKitchenOrders()
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const pendingOrders = orders.filter(o => o.status === "PENDING")
  const preparingOrders = orders.filter(o => o.status === "PREPARING")
  const readyOrders = orders.filter(o => o.status === "READY")

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
        <div className="text-sm text-gray-600">
          Auto-refresh: <span className="text-emerald-600 font-semibold">ON</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Pending ({pendingOrders.length})</h2>
          </div>
          
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending orders</p>
            ) : (
              pendingOrders.map(order => (
                <div key={order.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">#{order.invoiceNumber}</p>
                      {order.tableNumber && (
                        <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold">
                      {order.elapsedTime} min
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-900 font-medium">{item.productName}</span>
                        <span className="text-gray-700 font-bold">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-700 mb-3 italic bg-white p-2 rounded">
                      Note: {order.notes}
                    </p>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order.id, "PREPARING")}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Start Preparing
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-900">Preparing ({preparingOrders.length})</h2>
          </div>
          
          <div className="space-y-4">
            {preparingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders in preparation</p>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">#{order.invoiceNumber}</p>
                      {order.tableNumber && (
                        <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.elapsedTime > 15 
                        ? "bg-red-200 text-red-800" 
                        : "bg-blue-200 text-blue-800"
                    }`}>
                      {order.elapsedTime} min
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-900 font-medium">{item.productName}</span>
                        <span className="text-gray-700 font-bold">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-sm text-gray-700 mb-3 italic bg-white p-2 rounded">
                      Note: {order.notes}
                    </p>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order.id, "READY")}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Mark as Ready
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Ready ({readyOrders.length})</h2>
          </div>
          
          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders ready</p>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-gray-900">#{order.invoiceNumber}</p>
                      {order.tableNumber && (
                        <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">
                      {order.elapsedTime} min
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-900 font-medium">{item.productName}</span>
                        <span className="text-gray-700 font-bold">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-green-700 font-semibold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Ready for Pickup
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
