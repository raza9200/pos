"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"

interface ReportData {
  sales?: any
  inventory?: any
  profit?: any
}

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<"sales" | "inventory" | "profit">("sales")
  const [salesReport, setSalesReport] = useState<any>(null)
  const [inventoryReport, setInventoryReport] = useState<any>(null)
  const [profitReport, setProfitReport] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    })

    try {
      const [sales, inventory, profit] = await Promise.all([
        fetch(`/api/reports/sales?${params}`).then((r) => r.json()),
        fetch(`/api/reports/inventory`).then((r) => r.json()),
        fetch(`/api/reports/profit?${params}`).then((r) => r.json()),
      ])

      setSalesReport(sales)
      setInventoryReport(inventory)
      setProfitReport(profit)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Business insights and performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("sales")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "sales"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📊 Sales Report
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "inventory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📦 Inventory Report
            </button>
            <button
              onClick={() => setActiveTab("profit")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "profit"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              💰 Profit Report
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Sales Report */}
          {activeTab === "sales" && salesReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Sales</p>
                  <p className="text-3xl font-bold">${Number(salesReport.summary.totalSales).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Transactions</p>
                  <p className="text-3xl font-bold">{salesReport.summary.totalTransactions}</p>
                </div>
                <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Avg Transaction</p>
                  <p className="text-3xl font-bold">${Number(salesReport.summary.averageTransaction).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Discount</p>
                  <p className="text-3xl font-bold">${Number(salesReport.summary.totalDiscount).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                <div className="space-y-3">
                  {salesReport.topProducts.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">SKU: {item.product?.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{item.quantitySold} sold</p>
                        <p className="text-sm text-gray-500">${Number(item.revenue).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {activeTab === "inventory" && inventoryReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Products</p>
                  <p className="text-3xl font-bold">{inventoryReport.summary.totalProducts}</p>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Stock Value</p>
                  <p className="text-3xl font-bold">${Number(inventoryReport.summary.totalStockValue).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Low Stock Items</p>
                  <p className="text-3xl font-bold">{inventoryReport.summary.lowStockCount}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Out of Stock</p>
                  <p className="text-3xl font-bold">{inventoryReport.summary.outOfStockCount}</p>
                </div>
              </div>

              {inventoryReport.lowStockProducts.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold mb-4 text-amber-900">⚠️ Low Stock Alert</h3>
                  <div className="space-y-2">
                    {inventoryReport.lowStockProducts.map((product: any) => (
                      <div key={product.id} className="flex justify-between items-center bg-white p-3 rounded">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          {product.stock} / {product.minStock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profit Report */}
          {activeTab === "profit" && profitReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Gross Profit</p>
                  <p className="text-3xl font-bold">${Number(profitReport.summary.grossProfit).toFixed(2)}</p>
                  <p className="text-sm opacity-80 mt-1">
                    {profitReport.summary.grossProfitMargin.toFixed(2)}% margin
                  </p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Total Expenses</p>
                  <p className="text-3xl font-bold">${Number(profitReport.summary.totalExpenses).toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <p className="text-sm opacity-90 mb-2">Net Profit</p>
                  <p className="text-3xl font-bold">${Number(profitReport.summary.netProfit).toFixed(2)}</p>
                  <p className="text-sm opacity-80 mt-1">
                    {profitReport.summary.netProfitMargin.toFixed(2)}% margin
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Top Profitable Products</h3>
                <div className="space-y-3">
                  {profitReport.topProfitableProducts.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </span>
                        <p className="font-medium">{item.productName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">${Number(item.profit).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{item.quantitySold} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
