"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Monitor,
  GraduationCap,
  Building,
  Users,
  Award,
  Settings,
  UserCheck,
  Download,
} from "lucide-react"
import { getDashboardData } from "./actions"
import { DashboardHeader } from "@/components/dashboard-header"
import toast from "react-hot-toast"

// Mapping des icônes par rubrique
const rubriqueIcons = {
  1: MapPin,
  2: Monitor,
  3: GraduationCap,
  4: Building,
  5: UserCheck,
  6: Users,
  7: Award,
  8: Settings,
}

const rubriqueColors = {
  1: { color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-700" },
  2: { color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
  3: { color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-700" },
  4: { color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
  5: { color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700" },
  6: { color: "bg-indigo-500", bgColor: "bg-indigo-50", textColor: "text-indigo-700" },
  7: { color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
  8: { color: "bg-teal-500", bgColor: "bg-teal-50", textColor: "text-teal-700" },
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    budgetTotal: 0,
    depensesEffectuees: 0,
    resteAConsommer: 0,
    tauxRealisation: 0,
  })
  const [rubriques, setRubriques] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardData()
        if (data.success) {
          setStats({
            budgetTotal: data.data.statistiques.budgetTotal,
            depensesEffectuees: data.data.statistiques.budgetConsomme,
            resteAConsommer: data.data.statistiques.budgetRestant,
            tauxRealisation: data.data.statistiques.tauxConsommation,
          })
          setRubriques(data.data.progressionRubriques)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatMRU = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " MRU"
  }

  const handleRubriqueClick = (rubriqueId: number) => {
    window.location.href = `/dashboard/rubriques/${rubriqueId}`
  }

  const handleExportDashboard = () => {
    const dashboardData = [
      ["Type", "Valeur"],
      ["Budget Total Alloué", `${stats.budgetTotal} MRU`],
      ["Montant Dépensé", `${stats.depensesEffectuees} MRU`],
      ["Reste à Consommer", `${stats.resteAConsommer} MRU`],
      ["Taux de Réalisation", `${stats.tauxRealisation.toFixed(1)}%`],
      ["", ""],
      ["Rubriques", ""],
      ["Nom", "Budget", "Dépensé", "Progression"],
      ...rubriques.map((rubrique) => [
        `"${rubrique.nom}"`,
        `"${rubrique.budget} MRU"`,
        `"${rubrique.depense} MRU"`,
        `"${rubrique.progression.toFixed(1)}%"`,
      ]),
    ]

    const csvContent = dashboardData.map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `dashboard_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export du tableau de bord réalisé avec succès !")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader activeTab="dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader activeTab="dashboard" />

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
          <Button
            variant="outline"
            onClick={handleExportDashboard}
            className="flex items-center space-x-2 bg-transparent"
          >
            <Download className="w-4 h-4" />
            <span>Exporter les Données</span>
          </Button>
        </div>

        {/* Top Metrics - 3 cards seulement */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Montant Total Alloué</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMRU(stats.budgetTotal)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Montant Dépensé</p>
                  <p className="text-2xl font-bold text-green-600">{formatMRU(stats.depensesEffectuees)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reste à Consommer</p>
                  <p className="text-2xl font-bold text-orange-600">{formatMRU(stats.resteAConsommer)}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section - Barre bleue */}
        <Card className="bg-white mb-8 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression du Projet</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Avancement global</span>
                <span className="text-sm font-medium text-gray-900">{stats.tauxRealisation.toFixed(1)}%</span>
              </div>
              <Progress value={stats.tauxRealisation} className="h-3 [&>div]:bg-blue-500" />
              <p className="text-sm text-gray-600">
                {formatMRU(stats.depensesEffectuees)} sur {formatMRU(stats.budgetTotal)} utilisés
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rubriques Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rubriques du Projet</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {rubriques.map((rubrique) => {
              const IconComponent = rubriqueIcons[rubrique.id] || Settings
              const colors = rubriqueColors[rubrique.id] || rubriqueColors[8]

              return (
                <Card
                  key={rubrique.id}
                  className="bg-white hover:shadow-md transition-shadow cursor-pointer shadow-sm"
                  onClick={() => handleRubriqueClick(rubrique.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div
                        className={`w-12 h-12 ${colors.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComponent className={`w-6 h-6 ${colors.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">{rubrique.nom}</h4>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {rubrique.budget > 0 ? formatMRU(rubrique.budget) : "À définir"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dépensé:</span>
                        <span className="text-sm font-medium text-gray-900">{formatMRU(rubrique.depense)}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors.color} transition-all duration-300`}
                            style={{ width: `${Math.min(rubrique.progression, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end">
                          <Badge variant="secondary" className="text-xs">
                            {rubrique.progression.toFixed(0)}% utilisé
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
