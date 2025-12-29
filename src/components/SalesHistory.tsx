"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

interface Sale {
  id: string
  invoiceNumber: string
  total: number
  subtotal: number
  discount: number
  tax: number
  paymentMethod: string
  status: string
  createdAt: string
  customer: {
    name: string
  } | null
  user: {
    name: string
  }
  saleItems: {
    id: string
    quantity: number
    unitPrice: number
    total: number
    product: {
      name: string
      sku: string
    }
  }[]
}

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([])
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    let url = "/api/sales"
    if (dateFilter.startDate && dateFilter.endDate) {
      url += `?startDate=${dateFilter.startDate}&endDate=${dateFilter.endDate}`
    }
    const response = await fetch(url)
    const data = await response.json()
    setSales(data)
  }

  const handleFilterApply = () => {
    fetchSales()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800"
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      case "PARTIAL_REFUND":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return "💵"
      case "CARD":
        return "💳"
      case "MOBILE":
        return "📱"
      default:
        return "💰"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600 mt-1">View and manage all sales transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleFilterApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setDateFilter({ startDate: "", endDate: "" })
              setTimeout(fetchSales, 0)
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Sales Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sales.map((sale) => (
          <div
            key={sale.id}
            onClick={() => setSelectedSale(sale)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {sale.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(sale.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                  {sale.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{sale.customer?.name || "Walk-in"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cashier:</span>
                  <span className="font-medium">{sale.user.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{sale.saleItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-medium">
                    {getPaymentMethodIcon(sale.paymentMethod)} {sale.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total:</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    ${Number(sale.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sales.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sales found</h3>
          <p className="mt-1 text-sm text-gray-500">No sales match your filter criteria.</p>
        </div>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSale.invoiceNumber}
                </h2>
                <p className="text-gray-600 mt-1">
                  {format(new Date(selectedSale.createdAt), "MMMM dd, yyyy 'at' HH:mm:ss")}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{selectedSale.customer?.name || "Walk-in Customer"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Served By</p>
                <p className="font-medium">{selectedSale.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">
                  {getPaymentMethodIcon(selectedSale.paymentMethod)} {selectedSale.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSale.status)}`}>
                  {selectedSale.status}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Items</h3>
              <div className="space-y-3">
                {selectedSale.saleItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${Number(item.total).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${Number(selectedSale.subtotal).toFixed(2)}</span>
              </div>
              {selectedSale.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-red-600">-${Number(selectedSale.discount).toFixed(2)}</span>
                </div>
              )}
              {selectedSale.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${Number(selectedSale.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${Number(selectedSale.total).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
