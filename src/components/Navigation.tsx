"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface NavItem {
  href: string
  label: string
  roles: string[]
}

const navItems: NavItem[] = [
  { href: "/pos", label: "POS", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/products", label: "Products", roles: ["ADMIN", "MANAGER"] },
  { href: "/categories", label: "Categories", roles: ["ADMIN", "MANAGER"] },
  { href: "/customers", label: "Customers", roles: ["ADMIN", "MANAGER"] },
  { href: "/suppliers", label: "Suppliers", roles: ["ADMIN", "MANAGER"] },
  { href: "/sales", label: "Sales History", roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { href: "/expenses", label: "Expenses", roles: ["ADMIN", "MANAGER"] },
  { href: "/reports", label: "Reports", roles: ["ADMIN", "MANAGER"] },
  { href: "/users", label: "Users", roles: ["ADMIN"] },
]

interface NavigationProps {
  userRole: string
  userName: string
}

export function Navigation({ userRole, userName }: NavigationProps) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  )

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">POS System</h1>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              {userName} ({userRole})
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
