"use client"

import { useState } from "react"

type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED"

type Table = {
  id: number
  number: number
  capacity: number
  status: TableStatus
  currentOrder?: string
  reservedBy?: string
  reservedTime?: string
}

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: 1, capacity: 2, status: "AVAILABLE" },
    { id: 2, number: 2, capacity: 4, status: "OCCUPIED", currentOrder: "INV-000001" },
    { id: 3, number: 3, capacity: 2, status: "AVAILABLE" },
    { id: 4, number: 4, capacity: 6, status: "RESERVED", reservedBy: "John Doe", reservedTime: "19:00" },
    { id: 5, number: 5, capacity: 4, status: "OCCUPIED", currentOrder: "INV-000002" },
    { id: 6, number: 6, capacity: 2, status: "AVAILABLE" },
    { id: 7, number: 7, capacity: 8, status: "AVAILABLE" },
    { id: 8, number: 8, capacity: 4, status: "RESERVED", reservedBy: "Jane Smith", reservedTime: "20:00" },
    { id: 9, number: 9, capacity: 2, status: "AVAILABLE" },
    { id: 10, number: 10, capacity: 4, status: "AVAILABLE" },
    { id: 11, number: 11, capacity: 6, status: "AVAILABLE" },
    { id: 12, number: 12, capacity: 4, status: "AVAILABLE" },
  ])

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showModal, setShowModal] = useState(false)

  const getStatusColor = (status: TableStatus) => {
    const colors = {
      AVAILABLE: "bg-emerald-100 border-emerald-300 hover:border-emerald-400",
      OCCUPIED: "bg-red-100 border-red-300 hover:border-red-400",
      RESERVED: "bg-yellow-100 border-yellow-300 hover:border-yellow-400"
    }
    return colors[status]
  }

  const getStatusBadgeColor = (status: TableStatus) => {
    const colors = {
      AVAILABLE: "bg-emerald-500",
      OCCUPIED: "bg-red-500",
      RESERVED: "bg-yellow-500"
    }
    return colors[status]
  }

  const updateTableStatus = (tableId: number, newStatus: TableStatus) => {
    setTables(tables.map(table => 
      table.id === tableId ? { ...table, status: newStatus } : table
    ))
    setShowModal(false)
    setSelectedTable(null)
  }

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === "AVAILABLE").length,
    occupied: tables.filter(t => t.status === "OCCUPIED").length,
    reserved: tables.filter(t => t.status === "RESERVED").length,
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Table Management</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Tables</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Available</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Occupied</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.occupied}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Reserved</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.reserved}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700">Reserved</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => {
              setSelectedTable(table)
              setShowModal(true)
            }}
            className={`relative p-6 rounded-2xl border-2 transition-all ${getStatusColor(table.status)} hover:shadow-lg`}
          >
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusBadgeColor(table.status)}`}></div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center border-2 border-gray-300">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 text-lg">Table {table.number}</p>
              <p className="text-sm text-gray-600">{table.capacity} seats</p>
              {table.currentOrder && (
                <p className="text-xs text-gray-700 mt-1 font-semibold">{table.currentOrder}</p>
              )}
              {table.reservedBy && (
                <>
                  <p className="text-xs text-gray-700 mt-1">{table.reservedBy}</p>
                  <p className="text-xs text-gray-600">{table.reservedTime}</p>
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Table Details Modal */}
      {showModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Table {selectedTable.number}</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedTable(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTable.capacity} seats</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedTable.status}</p>
                </div>

                {selectedTable.currentOrder && (
                  <div>
                    <p className="text-sm text-gray-600">Current Order</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedTable.currentOrder}</p>
                  </div>
                )}

                {selectedTable.reservedBy && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Reserved By</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTable.reservedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Reserved Time</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedTable.reservedTime}</p>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">Change Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => updateTableStatus(selectedTable.id, "AVAILABLE")}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
                    >
                      Available
                    </button>
                    <button
                      onClick={() => updateTableStatus(selectedTable.id, "OCCUPIED")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Occupied
                    </button>
                    <button
                      onClick={() => updateTableStatus(selectedTable.id, "RESERVED")}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      Reserved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
