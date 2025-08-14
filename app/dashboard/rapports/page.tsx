"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Download, BarChart3, Activity, FileText, DollarSign, TrendingUp, PieChart } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getReportData, exportReportData, type ReportData } from "./actions"

export default function RapportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const result = await getReportData()
      if (result.success && result.data) {
        setReportData(result.data)
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors du chargement du rapport",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading report data:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReportData()
    setRefreshing(false)
    toast({
      title: "Succès",
      description: "Rapport actualisé avec succès",
    })
  }

  const handleExport = async (format: "csv" | "excel" = "csv") => {
    setExporting(true)
    try {
      const result = await exportReportData(format)
      if (result.success) {
        toast({
          title: "Succès",
          description: `Rapport exporté en ${format.toUpperCase()}`,
        })
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'export",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export du rapport",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "validé":
      case "terminé":
      case "en cours":
        return "default"
      case "en attente":
      case "planifié":
        return "secondary"
      case "rejeté":
      case "annulé":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-700">Génération du rapport en cours...</p>
          <p className="text-sm text-gray-500 mt-2">Veuillez patienter</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-gray-700">Aucune donnée de rapport disponible</p>
          <Button onClick={loadReportData} className="mt-4 bg-red-600 hover:bg-red-700">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Rapports
          </h1>
          <p className="text-gray-600 mt-1">Tableau de bord et analyses des performances budgétaires</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            variant="outline"
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button
            onClick={() => handleExport("excel")}
            disabled={exporting}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vue-generale" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger
            value="vue-generale"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vue Générale
          </TabsTrigger>
          <TabsTrigger
            value="budget"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Budget
          </TabsTrigger>
          <TabsTrigger
            value="activites"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
          >
            <Activity className="h-4 w-4 mr-2" />
            Activités
          </TabsTrigger>
          <TabsTrigger
            value="tendances"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Tendances
          </TabsTrigger>
        </TabsList>

        {/* Vue Générale */}
        <TabsContent value="vue-generale" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">Total Missions</CardTitle>
                <FileText className="h-4 w-4 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalMissions}</div>
                <p className="text-xs text-blue-200">Missions créées</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Total Activités</CardTitle>
                <Activity className="h-4 w-4 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalActivites}</div>
                <p className="text-xs text-green-200">Activités planifiées</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-100">Total Dépenses</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalDepenses}</div>
                <p className="text-xs text-orange-200">Dépenses enregistrées</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">Rubriques</CardTitle>
                <PieChart className="h-4 w-4 text-purple-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalRubriques}</div>
                <p className="text-xs text-purple-200">Catégories actives</p>
              </CardContent>
            </Card>
          </div>

          {/* Missions récentes */}
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Missions Récentes</CardTitle>
              <CardDescription className="text-blue-600">Les 5 dernières missions créées</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reportData.missionsRecentes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-700 font-semibold">Nom</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Date Début</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Date Fin</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Budget</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Statut</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Activités</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.missionsRecentes.map((mission, index) => (
                      <TableRow key={mission.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell className="font-medium text-gray-900">{mission.nom}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(mission.dateDebut)}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(mission.dateFin)}</TableCell>
                        <TableCell className="font-mono text-green-600 font-semibold">
                          {formatCurrency(mission.budget)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatutBadgeVariant(mission.statutValidation)} className="font-medium">
                            {mission.statutValidation}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {mission.activitesCount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Aucune mission trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget */}
        <TabsContent value="budget" className="space-y-6">
          {/* Aperçu budgétaire */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-100">Budget Total</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.totalBudget)}</div>
                <p className="text-xs text-emerald-200">Alloué aux missions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-100">Budget Consommé</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.budgetConsomme)}</div>
                <p className="text-xs text-red-200">{reportData.pourcentageBudgetUtilise.toFixed(1)}% utilisé</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-lime-600 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">Budget Restant</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(reportData.budgetRestant)}</div>
                <p className="text-xs text-green-200">
                  {(100 - reportData.pourcentageBudgetUtilise).toFixed(1)}% disponible
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Barre de progression budgétaire */}
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="text-green-800">Utilisation du Budget</CardTitle>
              <CardDescription className="text-green-600">Progression de la consommation budgétaire</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">0</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(reportData.budgetConsomme)} / {formatCurrency(reportData.totalBudget)}
                </span>
                <span className="text-gray-600">{formatCurrency(reportData.totalBudget)}</span>
              </div>
              <Progress value={reportData.pourcentageBudgetUtilise} className="w-full h-4 bg-gray-200" />
              <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <span className="font-semibold text-green-600">{reportData.pourcentageBudgetUtilise.toFixed(1)}%</span>{" "}
                du budget total utilisé
              </div>
            </CardContent>
          </Card>

          {/* Dépenses récentes */}
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
              <CardTitle className="text-orange-800">Dépenses Récentes</CardTitle>
              <CardDescription className="text-orange-600">Les 10 dernières dépenses enregistrées</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reportData.depensesRecentes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-700 font-semibold">Nom</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Montant</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                      <TableHead className="text-gray-700 font-semibold">Mission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.depensesRecentes.map((depense, index) => (
                      <TableRow key={depense.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell className="font-medium text-gray-900">{depense.nom}</TableCell>
                        <TableCell className="font-mono font-semibold text-red-600">
                          {formatCurrency(depense.montant)}
                        </TableCell>
                        <TableCell className="text-gray-600">{formatDate(depense.date)}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{depense.mission.nom}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Aucune dépense trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activités */}
        <TabsContent value="activites" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activités par statut */}
            <Card className="bg-white shadow-xl border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                <CardTitle className="text-purple-800">Activités par Statut</CardTitle>
                <CardDescription className="text-purple-600">
                  Répartition des activités selon leur statut
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {reportData.activitesParStatut.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.activitesParStatut.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{item.statut}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {item.count}
                            </Badge>
                            <span className="text-sm text-purple-600 font-medium">{item.pourcentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={item.pourcentage} className="h-3 bg-purple-100" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Aucune activité trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top rubriques */}
            <Card className="bg-white shadow-xl border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
                <CardTitle className="text-cyan-800">Top Rubriques</CardTitle>
                <CardDescription className="text-cyan-600">Rubriques les plus utilisées</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {reportData.topRubriques.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.topRubriques.slice(0, 5).map((rubrique, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{rubrique.nom}</div>
                          <div className="text-sm text-gray-600">
                            {rubrique.activitesCount} activités •{" "}
                            <span className="text-green-600 font-semibold">{formatCurrency(rubrique.budgetTotal)}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 border-cyan-200">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Aucune rubrique trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Missions par statut */}
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
              <CardTitle className="text-indigo-800">Missions par Statut</CardTitle>
              <CardDescription className="text-indigo-600">État d'avancement des missions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.missionsParStatut.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reportData.missionsParStatut.map((item, index) => (
                    <div
                      key={index}
                      className="text-center p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-shadow"
                    >
                      <div className="text-3xl font-bold mb-2 text-indigo-600">{item.count}</div>
                      <div className="text-sm font-medium mb-1 text-gray-800">{item.statut}</div>
                      <div className="text-xs text-gray-600 bg-indigo-50 px-2 py-1 rounded-full">
                        {item.pourcentage.toFixed(1)}% du total
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Aucune mission trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tendances */}
        <TabsContent value="tendances" className="space-y-6">
          {/* Évolution des dépenses */}
          <Card className="bg-white shadow-xl border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
              <CardTitle className="text-orange-800">Évolution des Dépenses</CardTitle>
              <CardDescription className="text-orange-600">Dépenses par mois sur les 12 derniers mois</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {reportData.depensesParMois.length > 0 ? (
                <div className="space-y-4">
                  {reportData.depensesParMois.map((item, index) => (
                    <div key={index} className="space-y-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-orange-800">{item.mois}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {item.count} dépenses
                          </span>
                          <span className="font-mono font-semibold text-orange-700">{formatCurrency(item.total)}</span>
                        </div>
                      </div>
                      <Progress
                        value={
                          reportData.depensesParMois.length > 0
                            ? (item.total / Math.max(...reportData.depensesParMois.map((d) => d.total))) * 100
                            : 0
                        }
                        className="h-3 bg-orange-100"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Aucune donnée de dépense trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyse comparative */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white shadow-xl border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
                <CardTitle className="text-teal-800">Performance Budgétaire</CardTitle>
                <CardDescription className="text-teal-600">Indicateurs clés de performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="text-sm text-teal-700">Taux d'utilisation du budget</span>
                  <span className="font-semibold text-teal-800">{reportData.pourcentageBudgetUtilise.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="text-sm text-cyan-700">Dépense moyenne par activité</span>
                  <span className="font-semibold text-cyan-800">
                    {reportData.totalActivites > 0
                      ? formatCurrency(reportData.budgetConsomme / reportData.totalActivites)
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-700">Budget moyen par mission</span>
                  <span className="font-semibold text-blue-800">
                    {reportData.totalMissions > 0
                      ? formatCurrency(reportData.totalBudget / reportData.totalMissions)
                      : formatCurrency(0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
                <CardTitle className="text-rose-800">Statistiques d'Activité</CardTitle>
                <CardDescription className="text-rose-600">Métriques d'engagement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
                  <span className="text-sm text-rose-700">Activités par mission</span>
                  <span className="font-semibold text-rose-800">
                    {reportData.totalMissions > 0
                      ? (reportData.totalActivites / reportData.totalMissions).toFixed(1)
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-sm text-pink-700">Dépenses par activité</span>
                  <span className="font-semibold text-pink-800">
                    {reportData.totalActivites > 0
                      ? (reportData.totalDepenses / reportData.totalActivites).toFixed(1)
                      : "0"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-purple-700">Rubriques utilisées</span>
                  <span className="font-semibold text-purple-800">{reportData.totalRubriques}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
