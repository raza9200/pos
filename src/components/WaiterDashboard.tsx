"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import Link from "next/link"

export default function WaiterDashboard() {
  const [stats, setStats] = useState({
    myOrders: 0,
    pendingOrders: 0,
    readyToServe: 0,
    completedToday: 0,
  })

  const [myActiveOrders, setMyActiveOrders] = useState<any[]>([])
  const [readyOrders, setReadyOrders] = useState<any[]>([])

  useEffect(() => {
    fetchWaiterData()
  }, [])

  const fetchWaiterData = async () => {
    try {
      // Fetch orders data
      const ordersRes = await fetch("/api/orders")
      const orders = await ordersRes.json()

      // Calculate stats
      const pending = orders.filter((o: any) => o.status === "PENDING" || o.status === "PREPARING").length
      const ready = orders.filter((o: any) => o.status === "READY").length
      const completed = orders.filter((o: any) => 
        o.status === "COMPLETED" && 
        new Date(o.createdAt).toDateString() === new Date().toDateString()
      ).length

      setStats({
        myOrders: orders.length,
        pendingOrders: pending,
        readyToServe: ready,
        completedToday: completed,
      })

      // Set active orders (pending, preparing, ready, served)
      const active = orders.filter((o: any) => 
        ["PENDING", "PREPARING", "READY", "SERVED"].includes(o.status)
      ).slice(0, 5)
      setMyActiveOrders(active)

      // Set ready orders
      const readyToServe = orders.filter((o: any) => o.status === "READY")
      setReadyOrders(readyToServe)
    } catch (error) {
      console.error("Error fetching waiter data:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PREPARING":
        return "bg-orange-100 text-orange-800"
      case "READY":
        return "bg-blue-100 text-blue-800"
      case "SERVED":
        return "bg-emerald-100 text-emerald-800"
      case "COMPLETED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waiter Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your orders and serve customers efficiently.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/orders"
          className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Quick Action</p>
              <p className="text-2xl font-bold mt-2">Create New Order</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/tables"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Quick Action</p>
              <p className="text-2xl font-bold mt-2">View Tables</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/billing"
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Quick Action</p>
              <p className="text-2xl font-bold mt-2">Process Payment</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">My Active Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.myOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ready to Serve</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.readyToServe}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-violet-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Completed Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ready to Serve Orders - Priority */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Ready to Serve</h2>
            {readyOrders.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {readyOrders.length} orders
              </span>
            )}
          </div>
          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">No orders ready to serve</p>
                <p className="text-sm">Check back soon for ready orders</p>
              </div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">Order #{order.id.slice(-6)}</span>
                        {order.tableNumber && (
                          <span className="text-sm text-gray-600">• Table {order.tableNumber}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} items • Rs {order.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
                      READY
                    </span>
                  </div>
                  <Link
                    href={`/orders`}
                    className="mt-3 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Mark as Served
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Active Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Active Orders</h2>
            <Link href="/orders" className="text-orange-600 hover:text-orange-700 text-sm font-semibold">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {myActiveOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="font-medium">No active orders</p>
                <p className="text-sm">Create a new order to get started</p>
              </div>
            ) : (
              myActiveOrders.map((order) => (
                <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">Order #{order.id.slice(-6)}</span>
                        {order.tableNumber && (
                          <span className="text-sm text-gray-600">• Table {order.tableNumber}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 0} items • Rs {order.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(order.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Quick Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="text-orange-600">✓</span>
            <p>Check "Ready to Serve" section regularly for completed orders</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">✓</span>
            <p>Create orders from the Orders page or use the quick action button</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-600">✓</span>
            <p>Process payments from the Billing page after serving orders</p>
          </div>
        </div>
      </div>
    </div>
  )
}
