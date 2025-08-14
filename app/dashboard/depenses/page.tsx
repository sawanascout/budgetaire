"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { getDepenses, getMissionsForSelect } from "./actions"
import type { Mission } from "@prisma/client"
import { DepenseTable } from "@/components/depenses/depense-table"
import type { DepenseClient } from "./actions"

// Define Depense type based on exact schema
interface Depense {
  id: number
  nom: string
  date: Date
  montant: number
  justificatif: string
  missionId: number
  mission?: Mission
}

export default function DepensesPage() {
  const [depenses, setDepenses] = useState<DepenseClient[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [depensesData, missionsData] = await Promise.all([getDepenses(), getMissionsForSelect()])
      setDepenses(depensesData)
      setMissions(missionsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Erreur",
        description: "Échec du chargement des données.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des dépenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <DepenseTable initialDepenses={depenses} missions={missions} onRefresh={fetchData} />
    </div>
  )
}
