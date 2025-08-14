"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/app/dashboard/utilisateurs/auth-actions"
import { Toaster } from "react-hot-toast"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  )
}
