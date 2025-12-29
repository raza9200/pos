"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  price: number
  stock: number
  category: {
    name: string
  }
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  discount: number
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  loyaltyPoints: number
}

export default function POSScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH")
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchProducts = async (search?: string) => {
    try {
      const url = search
        ? `/api/products?search=${encodeURIComponent(search)}`
        : "/api/products"
      const response = await fetch(url)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.length >= 2) {
      fetchProducts(value)
    } else if (value.length === 0) {
      fetchProducts()
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          discount: 0,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const updateItemDiscount = (productId: string, discount: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, discount } : item
      )
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      return sum + item.price * item.quantity - item.discount
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    return subtotal - discount + tax
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }

    setIsLoading(true)

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
      }))

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          items,
          paymentMethod,
          discount,
          tax,
        }),
      })

      if (response.ok) {
        const sale = await response.json()
        alert(`Sale completed! Invoice: ${sale.invoiceNumber}`)
        // Reset cart
        setCart([])
        setSelectedCustomer(null)
        setDiscount(0)
        setTax(0)
        setSearchTerm("")
        fetchProducts()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error completing sale:", error)
      alert("Failed to complete sale")
    } finally {
      setIsLoading(false)
    }
  }

  const subtotal = calculateSubtotal()
  const total = calculateTotal()

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Products</h2>
            <input
              type="text"
              placeholder="Search products (name, SKU, barcode)..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.slice(0, 12).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category.name}</p>
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xl font-bold text-green-600">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {product.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Cart</h2>

            {/* Customer Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer (Optional)
              </label>
              <select
                value={selectedCustomer || ""}
                onChange={(e) => setSelectedCustomer(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.loyaltyPoints} points
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="border-b pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) =>
                          updateItemDiscount(
                            item.productId,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Disc."
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="ml-auto font-semibold">
                        ${(item.price * item.quantity - item.discount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm">Discount:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                />
              </div>

              <div className="flex gap-2 items-center">
                <label className="text-sm">Tax:</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-gray-900"
                />
              </div>

              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="MOBILE">Mobile Payment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isLoading}
              className="w-full mt-4 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
