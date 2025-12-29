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
  status: "PENDING" | "PREPARING" | "READY" | "SERVED" | "COMPLETED"
  notes?: string
  createdAt: string
}

type Product = {
  id: string
  name: string
  price: number
  categoryId: string
  stock: number
}

type Category = {
  id: string
  name: string
}

interface OrdersManagementProps {
  userRole?: string
}

export default function OrdersManagement({ userRole }: OrdersManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // New order form state
  const [tableNumber, setTableNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")

  useEffect(() => {
    fetchOrders()
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const addItemToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      const newItem: OrderItem = {
        id: Math.random().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }
      setOrderItems([...orderItems, newItem])
    }
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems(orderItems.filter(item => item.id !== itemId))
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
          : item
      ))
    }
  }

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId))
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.05 // 5% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const createOrder = async () => {
    if (orderItems.length === 0) {
      alert("Please add items to the order")
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber,
          customerName,
          items: orderItems,
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          total: calculateTotal(),
          notes: orderNotes,
          status: "PENDING"
        })
      })

      if (response.ok) {
        // Reset form
        setTableNumber("")
        setCustomerName("")
        setOrderItems([])
        setOrderNotes("")
        setShowNewOrderModal(false)
        fetchOrders()
      } else {
        alert("Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error creating order")
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.categoryId === selectedCategory)

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PREPARING: "bg-blue-100 text-blue-800",
      READY: "bg-green-100 text-green-800",
      SERVED: "bg-purple-100 text-purple-800",
      COMPLETED: "bg-gray-100 text-gray-800"
    }
    return colors[status]
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          + New Order
        </button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Order #{order.invoiceNumber}</h3>
                {order.tableNumber && (
                  <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                )}
                {order.customerName && (
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                  <span className="text-gray-900 font-medium">Rs {item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-4">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-orange-600">Rs {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update Buttons */}
            <div className="flex gap-2 flex-wrap">
              {/* Only CHEF/ADMIN/MANAGER can start preparing */}
              {order.status === "PENDING" && ["ADMIN", "MANAGER", "CHEF"].includes(userRole || "") && (
                <button
                  onClick={() => updateOrderStatus(order.id, "PREPARING")}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Start Preparing
                </button>
              )}
              {/* Only CHEF/ADMIN/MANAGER can mark as ready */}
              {order.status === "PREPARING" && ["ADMIN", "MANAGER", "CHEF"].includes(userRole || "") && (
                <button
                  onClick={() => updateOrderStatus(order.id, "READY")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Mark Ready
                </button>
              )}
              {/* Only WAITER/CASHIER can mark READY orders as SERVED */}
              {order.status === "READY" && ["WAITER", "CASHIER"].includes(userRole || "") && (
                <button
                  onClick={() => updateOrderStatus(order.id, "SERVED")}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Mark Served
                </button>
              )}
              {/* WAITER/CASHIER can go to billing for SERVED orders */}
              {order.status === "SERVED" && ["WAITER", "CASHIER"].includes(userRole || "") && (
                <a
                  href="/billing"
                  className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 inline-block"
                >
                  Go to Billing
                </a>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">New Order</h2>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Items Section */}
                <div className="lg:col-span-2">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addItemToOrder(product)}
                        className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:shadow-lg transition-all border border-orange-200 text-left"
                        disabled={product.stock <= 0}
                      >
                        <h4 className="font-semibold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-orange-600 font-bold">Rs {product.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Summary Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                      placeholder="Customer name"
                    />
                  </div>

                  <div className="mb-4 max-h-64 overflow-y-auto">
                    <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                    {orderItems.length === 0 ? (
                      <p className="text-gray-500 text-sm">No items added</p>
                    ) : (
                      <div className="space-y-2">
                        {orderItems.map(item => (
                          <div key={item.id} className="bg-white p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900 text-sm">{item.productName}</span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                ×
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                              >
                                -
                              </button>
                              <span className="text-gray-900 font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-gray-700"
                              >
                                +
                              </button>
                              <span className="ml-auto text-gray-900 font-semibold">Rs {item.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                      rows={2}
                      placeholder="Special instructions..."
                    />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-medium">Rs {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Tax (5%)</span>
                      <span className="font-medium">Rs {calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                      <span>Total</span>
                      <span className="text-orange-600">Rs {calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={createOrder}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    disabled={orderItems.length === 0}
                  >
                    Create Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
