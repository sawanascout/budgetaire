"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  Target,
  Download,
  RefreshCw,
  Activity,
  PieChart,
  Calendar,
  Award,
} from "lucide-react"
import { getIndicatorsData, exportIndicatorsData } from "./actions"

interface IndicatorsData {
  statistiques: {
    totalMissions: number
    totalActivites: number
    totalDepenses: number
    totalRubriques: number
    budgetTotal: number
    budgetConsomme: number
    budgetRestant: number
    tauxConsommation: number
  }
  missionsParStatut: Record<string, number>
  activitesParStatut: Record<string, number>
  rubriqueStats: Array<{
    nom: string
    nombreActivites: number
    budgetPrevu: number
    budgetConsomme: number
  }>
  depensesParMois: Array<{
    mois: string
    montant: number
    nombreDepenses: number
    evolution: number
  }>
  missionsParBudget: Array<{
    id: number
    nom: string
    budget: number
    budgetConsomme: number
    nombreActivites: number
    nombreDepenses: number
  }>
  efficaciteRubriques: Array<{
    nom: string
    nombreActivites: number
    budgetPrevu: number
    budgetConsomme: number
    efficacite: number
  }>
  performanceGlobale: {
    tauxRealisationMissions: number
    moyenneBudgetMission: number
    moyenneDepensesMission: number
  }
}

export default function IndicatorsPage() {
  const [data, setData] = useState<IndicatorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getIndicatorsData()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || "Erreur lors du chargement des données")
      }
    } catch (err) {
      setError("Erreur lors du chargement des données")
      console.error("Erreur:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleExport = async (format: "csv" | "excel") => {
    try {
      const result = await exportIndicatorsData(format)
      if (result.success) {
        // Ici vous pouvez déclencher le téléchargement du fichier
        console.log("Export réussi:", result.message)
      }
    } catch (err) {
      console.error("Erreur lors de l'export:", err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Indicateurs Clés</h1>
            <p className="text-gray-600 text-lg">Chargement des données...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Indicateurs Clés</h1>
            <p className="text-red-600 text-lg">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Indicateurs Clés</h1>
          <p className="text-gray-600 text-lg">Analyse détaillée des performances et tendances budgétaires</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => handleExport("csv")} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => handleExport("excel")}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Budget Total</CardTitle>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-all duration-200">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(data.statistiques.budgetTotal)}</div>
            <div className="flex items-center text-sm text-green-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" />
              {data.statistiques.totalMissions} missions
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Budget Consommé</CardTitle>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-all duration-200">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(data.statistiques.budgetConsomme)}
            </div>
            <div className="flex items-center text-sm text-blue-600 font-medium">
              <Activity className="w-4 h-4 mr-1" />
              {data.statistiques.tauxConsommation.toFixed(1)}% du budget
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Activités Totales</CardTitle>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-all duration-200">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">{data.statistiques.totalActivites}</div>
            <div className="flex items-center text-sm text-purple-600 font-medium">
              <FileText className="w-4 h-4 mr-1" />
              {data.statistiques.totalRubriques} rubriques
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Performance</CardTitle>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-all duration-200">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {data.performanceGlobale.tauxRealisationMissions.toFixed(1)}%
            </div>
            <div className="flex items-center text-sm text-orange-600 font-medium">
              <Award className="w-4 h-4 mr-1" />
              Taux de réalisation
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tendances">Tendances</TabsTrigger>
          <TabsTrigger value="rubriques">Rubriques</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Répartition Budgétaire
                </CardTitle>
                <CardDescription>Utilisation du budget global</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget consommé</span>
                    <span className="font-medium">{formatCurrency(data.statistiques.budgetConsomme)}</span>
                  </div>
                  <Progress value={data.statistiques.tauxConsommation} className="h-3" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget restant</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(data.statistiques.budgetRestant)}
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Moyenne par mission: {formatCurrency(data.performanceGlobale.moyenneBudgetMission)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Missions par Budget</CardTitle>
                <CardDescription>Missions les plus coûteuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.missionsParBudget.slice(0, 5).map((mission, index) => (
                    <div key={mission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{mission.nom}</p>
                          <p className="text-sm text-gray-600">
                            {mission.nombreActivites} activités • {mission.nombreDepenses} dépenses
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(mission.budgetConsomme)}</p>
                        <p className="text-sm text-gray-600">/{formatCurrency(mission.budget)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Missions par Statut</CardTitle>
                <CardDescription>Répartition des missions selon leur statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.missionsParStatut).map(([statut, count]) => {
                    const percentage =
                      data.statistiques.totalMissions > 0 ? (count / data.statistiques.totalMissions) * 100 : 0

                    return (
                      <div key={statut} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{statut}</span>
                          <span>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activités par Statut</CardTitle>
                <CardDescription>Répartition des activités selon leur statut</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.activitesParStatut).map(([statut, count]) => {
                    const percentage =
                      data.statistiques.totalActivites > 0 ? (count / data.statistiques.totalActivites) * 100 : 0

                    return (
                      <div key={statut} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{statut}</span>
                          <span>
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tendances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Évolution des Dépenses (12 derniers mois)
              </CardTitle>
              <CardDescription>Tendance mensuelle des dépenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.depensesParMois.map((mois, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900 w-20">{mois.mois}</div>
                      <div className="flex items-center space-x-2">
                        {mois.evolution > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : mois.evolution < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        ) : null}
                        <span
                          className={`text-sm font-medium ${
                            mois.evolution > 0
                              ? "text-green-600"
                              : mois.evolution < 0
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {mois.evolution > 0 ? "+" : ""}
                          {mois.evolution.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatCurrency(mois.montant)}</div>
                      <div className="text-sm text-gray-600">
                        {mois.nombreDepenses} dépense{mois.nombreDepenses > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubriques" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Efficacité par Rubrique</CardTitle>
              <CardDescription>Performance budgétaire des rubriques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.efficaciteRubriques.map((rubrique, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{rubrique.nom}</h4>
                        <p className="text-sm text-gray-600">
                          {rubrique.nombreActivites} activité{rubrique.nombreActivites > 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge variant={rubrique.efficacite > 0 ? "default" : "destructive"}>
                        {rubrique.efficacite > 0 ? "+" : ""}
                        {rubrique.efficacite.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Budget prévu:</span>
                        <div className="font-medium">{formatCurrency(rubrique.budgetPrevu)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Budget consommé:</span>
                        <div className="font-medium">{formatCurrency(rubrique.budgetConsomme)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
