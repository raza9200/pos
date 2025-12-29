"use client"

import { useState, useEffect } from "react"

type Staff = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "WAITER"
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      setStaff(data)
    } catch (error) {
      console.error("Error fetching staff:", error)
    } finally {
      setLoading(false)
    }
  }

  const createStaff = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm)
      })

      if (response.ok) {
        setStaffForm({ name: "", email: "", password: "", role: "WAITER" })
        setShowModal(false)
        fetchStaff()
      } else {
        alert("Failed to create staff member")
      }
    } catch (error) {
      console.error("Error creating staff:", error)
      alert("Error creating staff member")
    }
  }

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/users/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      })
      fetchStaff()
    } catch (error) {
      console.error("Error toggling staff status:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-800",
      MANAGER: "bg-blue-100 text-blue-800",
      WAITER: "bg-green-100 text-green-800",
      CHEF: "bg-orange-100 text-orange-800",
      CASHIER: "bg-yellow-100 text-yellow-800"
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  const roleStats = {
    total: staff.length,
    active: staff.filter(s => s.isActive).length,
    admin: staff.filter(s => s.role === "ADMIN").length,
    manager: staff.filter(s => s.role === "MANAGER").length,
    waiter: staff.filter(s => s.role === "WAITER").length,
    chef: staff.filter(s => s.role === "CHEF").length,
    cashier: staff.filter(s => s.role === "CASHIER").length,
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg font-medium"
        >
          + Add Staff Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Total Staff</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{roleStats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Active</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{roleStats.active}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Waiters</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{roleStats.waiter}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-medium">Chefs</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{roleStats.chef}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStaffStatus(member.id, member.isActive)}
                      className={`px-4 py-2 rounded text-xs font-medium ${
                        member.isActive
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {member.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Staff Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="john@restaurant.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="WAITER">Waiter</option>
                  <option value="CHEF">Chef</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={createStaff}
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
