"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  Download,
  Trash2,
  BarChart3,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  Users,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getJournalEntries, getReportData, cleanupJournal, type JournalEntry, type ReportData } from "./actions"

export default function JournalPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Charger les données initiales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [journalRes, reportRes] = await Promise.all([getJournalEntries(), getReportData()])

      if (journalRes.success && journalRes.data) {
        setJournalEntries(journalRes.data)
      } else {
        toast({
          title: "Erreur",
          description: journalRes.error || "Erreur lors du chargement du journal",
          variant: "destructive",
        })
      }

      if (reportRes.success && reportRes.data) {
        setReportData(reportRes.data)
      } else {
        toast({
          title: "Erreur",
          description: reportRes.error || "Erreur lors du chargement du rapport",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading data:", error)
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
    await loadData()
    setRefreshing(false)
    toast({
      title: "Succès",
      description: "Données actualisées avec succès",
    })
  }

  const handleCleanup = async () => {
    try {
      const res = await cleanupJournal()
      if (res.success) {
        toast({
          title: "Succès",
          description: "Journal nettoyé avec succès",
        })
        await loadData()
      } else {
        toast({
          title: "Erreur",
          description: res.error || "Erreur lors du nettoyage",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du nettoyage du journal",
        variant: "destructive",
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
    }).format(amount)
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "default" as const
      case "update":
        return "secondary" as const
      case "delete":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const getStatutBadgeVariant = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "validé":
      case "terminé":
      case "en cours":
        return "default" as const
      case "en attente":
      case "planifié":
        return "secondary" as const
      case "rejeté":
      case "annulé":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Journal</h1>
          <p className="text-gray-600">Consultez les rapports d'activité et le journal des actions</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="rapport" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="rapport" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapport
          </TabsTrigger>
          <TabsTrigger value="journal" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            <Activity className="h-4 w-4 mr-2" />
            Journal d'actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rapport" className="space-y-6">
          {reportData && (
            <>
              {/* Statistiques générales */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Missions</CardTitle>
                    <FileText className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{reportData.totalMissions}</div>
                    <p className="text-xs text-blue-600">Missions créées</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Total Activités</CardTitle>
                    <Activity className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{reportData.totalActivites}</div>
                    <p className="text-xs text-green-600">Activités planifiées</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">Total Dépenses</CardTitle>
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">{reportData.totalDepenses}</div>
                    <p className="text-xs text-orange-600">Dépenses enregistrées</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Budget Restant</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{formatCurrency(reportData.budgetRestant)}</div>
                    <p className="text-xs text-purple-600">Disponible</p>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Overview */}
              <Card className="border-indigo-200">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <CardTitle className="text-indigo-900">Aperçu du Budget</CardTitle>
                  <CardDescription className="text-indigo-700">Suivi de l'utilisation du budget total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Budget Total:{" "}
                      <span className="font-semibold text-gray-900">{formatCurrency(reportData.totalBudget)}</span>
                    </span>
                    <span className="text-gray-600">
                      Consommé:{" "}
                      <span className="font-semibold text-red-600">{formatCurrency(reportData.budgetConsomme)}</span>
                    </span>
                  </div>
                  <Progress
                    value={reportData.totalBudget > 0 ? (reportData.budgetConsomme / reportData.totalBudget) * 100 : 0}
                    className="w-full h-3"
                  />
                  <div className="text-sm text-center text-gray-600">
                    <span className="font-semibold text-indigo-600">
                      {reportData.totalBudget > 0
                        ? ((reportData.budgetConsomme / reportData.totalBudget) * 100).toFixed(1)
                        : 0}
                      %
                    </span>{" "}
                    du budget utilisé
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Missions par statut */}
                <Card className="border-cyan-200">
                  <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                    <CardTitle className="text-cyan-900">Missions par Statut</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {reportData.missionsParStatut.length > 0 ? (
                        reportData.missionsParStatut.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">{item.statut}</span>
                            <Badge variant={getStatutBadgeVariant(item.statut)} className="font-semibold">
                              {item.count}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          Aucune mission trouvée
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Activités par statut */}
                <Card className="border-teal-200">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100">
                    <CardTitle className="text-teal-900">Activités par Statut</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {reportData.activitesParStatut.length > 0 ? (
                        reportData.activitesParStatut.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">{item.statut}</span>
                            <Badge variant={getStatutBadgeVariant(item.statut)} className="font-semibold">
                              {item.count}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          Aucune activité trouvée
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Rubriques */}
                <Card className="border-rose-200">
                  <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100">
                    <CardTitle className="text-rose-900">Top Rubriques</CardTitle>
                    <CardDescription className="text-rose-700">Par nombre d'activités</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {reportData.topRubriques.length > 0 ? (
                        reportData.topRubriques.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{item.nom}</span>
                              <div className="text-xs text-gray-500">{formatCurrency(item.budget)}</div>
                            </div>
                            <Badge variant="secondary" className="bg-rose-100 text-rose-800 font-semibold">
                              {item.count}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          Aucune rubrique trouvée
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Dépenses par mois */}
                <Card className="border-amber-200">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100">
                    <CardTitle className="text-amber-900">Dépenses par Mois</CardTitle>
                    <CardDescription className="text-amber-700">Derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {reportData.depensesParMois.length > 0 ? (
                        reportData.depensesParMois.slice(0, 6).map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50">
                            <span className="text-sm font-medium text-gray-700">{item.mois}</span>
                            <span className="text-sm font-semibold text-amber-700">{formatCurrency(item.total)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          Aucune dépense trouvée
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Missions récentes */}
              <Card className="border-emerald-200">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                  <CardTitle className="text-emerald-900">Missions Récentes</CardTitle>
                  <CardDescription className="text-emerald-700">Les 5 missions les plus récentes</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {reportData.missionsRecentes.length > 0 ? (
                    <div className="space-y-4">
                      {reportData.missionsRecentes.map((mission) => (
                        <div
                          key={mission.id}
                          className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <h4 className="font-semibold text-gray-900">{mission.nom}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(mission.dateDebut)} - {formatDate(mission.dateFin)}
                            </p>
                            <p className="text-sm text-blue-600">
                              <Users className="h-3 w-3 inline mr-1" />
                              {mission.activitesCount} activité{mission.activitesCount > 1 ? "s" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-emerald-700">{formatCurrency(mission.budget)}</div>
                            <Badge variant={getStatutBadgeVariant(mission.statutValidation)} className="mt-1">
                              {mission.statutValidation}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Aucune mission récente trouvée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Journal d'Actions</h2>
              <p className="text-sm text-gray-600">Historique des dernières actions effectuées</p>
            </div>
            <Button
              onClick={handleCleanup}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Nettoyer
            </Button>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <TableHead className="font-semibold text-slate-700">Date/Heure</TableHead>
                    <TableHead className="font-semibold text-slate-700">Action</TableHead>
                    <TableHead className="font-semibold text-slate-700">Table</TableHead>
                    <TableHead className="font-semibold text-slate-700">ID Enregistrement</TableHead>
                    <TableHead className="font-semibold text-slate-700">Utilisateur</TableHead>
                    <TableHead className="font-semibold text-slate-700">Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium">Aucune entrée de journal trouvée</p>
                          <p className="text-sm mt-1">
                            Le journal d'actions n'est pas encore configuré ou aucune action n'a été enregistrée.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    journalEntries.map((entry, index) => (
                      <TableRow key={entry.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell className="font-mono text-sm text-gray-600">{formatDate(entry.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(entry.action)} className="font-medium">
                            {entry.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{entry.table}</TableCell>
                        <TableCell className="text-blue-600 font-mono">#{entry.recordId}</TableCell>
                        <TableCell className="text-gray-700">
                          <span className="font-medium">
                            {entry.user.prenom} {entry.user.nom}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {entry.newValues && (
                              <details className="cursor-pointer">
                                <summary className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                  Voir détails
                                </summary>
                                <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs border">
                                  <pre className="whitespace-pre-wrap text-slate-700">
                                    {JSON.stringify(JSON.parse(entry.newValues), null, 2)}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
