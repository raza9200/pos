"use client"

import { useState, useEffect } from "react"

type Category = {
  id: string
  name: string
  description?: string
}

type MenuItem = {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  stock: number
  isActive: boolean
}

export default function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" })
  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    stock: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/products")
      ])
      
      const categoriesData = await categoriesRes.json()
      const productsData = await productsRes.json()
      
      setCategories(categoriesData)
      setMenuItems(productsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async () => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      })

      if (response.ok) {
        setCategoryForm({ name: "", description: "" })
        setShowCategoryModal(false)
        fetchData()
      }
    } catch (error) {
      console.error("Error creating category:", error)
    }
  }

  const createMenuItem = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          sku: `MENU-${Date.now()}`,
          costPrice: itemForm.price * 0.6 // 40% margin
        })
      })

      if (response.ok) {
        setItemForm({ name: "", description: "", price: 0, categoryId: "", stock: 0 })
        setShowItemModal(false)
        fetchData()
      }
    } catch (error) {
      console.error("Error creating menu item:", error)
    }
  }

  const toggleItemStatus = async (itemId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      fetchData()
    } catch (error) {
      console.error("Error toggling item status:", error)
    }
  }

  const filteredItems = selectedCategory === "all"
    ? menuItems
    : menuItems.filter(item => item.categoryId === selectedCategory)

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Category
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg font-medium"
          >
            + Add Menu Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
            selectedCategory === "all"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:border-orange-600"
          }`}
        >
          All Items ({menuItems.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap ${
              selectedCategory === cat.id
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-orange-600"
            }`}
          >
            {cat.name} ({menuItems.filter(i => i.categoryId === cat.id).length})
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <button
                  onClick={() => toggleItemStatus(item.id, item.isActive)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </button>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-orange-600">₹{item.price.toFixed(2)}</span>
                <span className="text-sm text-gray-600">Stock: {item.stock}</span>
              </div>
              
              <p className="text-xs text-gray-500">
                {categories.find(c => c.id === item.categoryId)?.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Category</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="e.g., Main Course"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  rows={3}
                  placeholder="Category description"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createCategory}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Menu Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="e.g., Chicken Biryani"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  rows={2}
                  placeholder="Item description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={itemForm.stock}
                    onChange={(e) => setItemForm({ ...itemForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createMenuItem}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
