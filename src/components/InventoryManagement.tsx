"use client"

import { useState, useEffect } from "react"

type Product = {
  id: string
  name: string
  sku: string
  stock: number
  minStock: number
  price: number
  categoryId: string
  categoryName?: string
}

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ])
      
      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      
      const productsWithCategory = productsData.map((p: Product) => ({
        ...p,
        categoryName: categoriesData.find((c: any) => c.id === p.categoryId)?.name
      }))
      
      setProducts(productsWithCategory)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock })
      })
      fetchProducts()
    } catch (error) {
      console.error("Error updating stock:", error)
    }
  }

  const lowStockItems = products.filter(p => p.stock <= p.minStock && p.stock > 0)
  const outOfStockItems = products.filter(p => p.stock === 0)

  const filteredProducts = 
    filter === "low" ? lowStockItems :
    filter === "out" ? outOfStockItems :
    products

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{lowStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockItems.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-6 py-2 rounded-lg font-medium ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter("low")}
          className={`px-6 py-2 rounded-lg font-medium ${
            filter === "low"
              ? "bg-yellow-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:border-yellow-600"
          }`}
        >
          Low Stock ({lowStockItems.length})
        </button>
        <button
          onClick={() => setFilter("out")}
          className={`px-6 py-2 rounded-lg font-medium ${
            filter === "out"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:border-red-600"
          }`}
        >
          Out of Stock ({outOfStockItems.length})
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min Stock</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{product.sku}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${
                      product.stock === 0 ? "text-red-600" :
                      product.stock <= product.minStock ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.minStock}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs {product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        Out of Stock
                      </span>
                    ) : product.stock <= product.minStock ? (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStock(product.id, product.stock + 10)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => updateStock(product.id, Math.max(0, product.stock - 10))}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                      >
                        -10
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
