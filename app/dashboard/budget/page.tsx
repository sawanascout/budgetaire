"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, DollarSign, Download } from "lucide-react"
import { getBudgetData } from "./actions"
import { DashboardHeader } from "@/components/dashboard-header"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type BudgetStats = {
  budgetAlloue: number
  depensesEffectuees: number
  enCours: number
  disponible: number
}

type RubriqueData = {
  nom: string
  budgetAlloue: number
  depense: number
  enCours: number
  disponible: number
  progression: number
}

export default function BudgetPage() {
  const [stats, setStats] = useState<BudgetStats>({
    budgetAlloue: 0,
    depensesEffectuees: 0,
    enCours: 0,
    disponible: 0,
  })
  const [rubriques, setRubriques] = useState<RubriqueData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState("2024")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const result = await getBudgetData()
        if (result.success) {
          // Calculer le montant dépensé en incluant "en cours" dans les dépenses
          const totalDepense = result.data.budgetParRubrique.reduce(
            (sum: number, rubrique: RubriqueData) => sum + rubrique.depense + rubrique.enCours,
            0,
          )

          setStats({
            ...result.data.statistiques,
            depensesEffectuees: totalDepense,
          })

          // Modifier les données des rubriques pour inclure "en cours" dans "dépense"
          const rubriquesModifiees = result.data.budgetParRubrique.map((rubrique: RubriqueData) => ({
            ...rubrique,
            depense: rubrique.depense + rubrique.enCours,
            enCours: 0,
            disponible: rubrique.budgetAlloue - (rubrique.depense + rubrique.enCours),
            progression: ((rubrique.depense + rubrique.enCours) / rubrique.budgetAlloue) * 100,
          }))

          setRubriques(rubriquesModifiees)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatMRU = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " MRU"
  }

  const getProgressColor = (progression: number) => {
    if (progression >= 80) return "bg-red-500"
    if (progression >= 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    // En-tête officiel mauritanien
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("République Islamique de Mauritanie", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Honneur - Fraternité - Justice", 105, 30, { align: "center" })

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Centre de Formation et d'Échange à Distance (CFED)", 105, 45, { align: "center" })
    doc.text("Plateforme pour la Formation Continue des Enseignants", 105, 55, { align: "center" })

    // Titre du rapport
    doc.setFontSize(18)
    doc.text("RAPPORT DE SUIVI BUDGÉTAIRE", 105, 75, { align: "center" })

    // Date
    doc.setFontSize(10)
    doc.text(`Nouakchott, le ${new Date().toLocaleDateString("fr-FR")}`, 20, 90)

    // Statistiques principales
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("STATISTIQUES BUDGÉTAIRES", 20, 110)

    const statsData = [
      ["Montant Total Alloué", formatMRU(stats.budgetAlloue)],
      ["Montant Dépensé", formatMRU(stats.depensesEffectuees)],
      ["Reste à Consommer", formatMRU(stats.budgetAlloue - stats.depensesEffectuees)],
      ["Taux de Consommation", `${((stats.depensesEffectuees / stats.budgetAlloue) * 100).toFixed(1)}%`],
    ]

    autoTable(doc, {
      startY: 120,
      head: [["Indicateur", "Valeur"]],
      body: statsData,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    })

    // Budget par rubrique
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("BUDGET PAR RUBRIQUE", 20, (doc as any).lastAutoTable.finalY + 20)

    const rubriqueData = rubriques.map((rubrique) => [
      rubrique.nom,
      formatMRU(rubrique.budgetAlloue),
      formatMRU(rubrique.depense),
      formatMRU(rubrique.disponible),
      `${rubrique.progression.toFixed(1)}%`,
    ])

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [["Rubrique", "Budget Alloué", "Dépensé", "Disponible", "Progression"]],
      body: rubriqueData,
      theme: "grid",
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 9 },
    })

    // Signatures
    const finalY = (doc as any).lastAutoTable.finalY + 30
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("LE DIRECTEUR", 150, finalY)
    doc.text("LE COMPTABLE", 50, finalY)

    // Télécharger le PDF
    const currentDate = new Date().toISOString().split("T")[0]
    const fileName = `CFED_Rapport_Suivi_Budgetaire_${currentDate}.pdf`
    doc.save(fileName)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader activeTab="budget" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader activeTab="budget" />

      <div className="px-8 py-8 space-y-6">
        {/* Statistiques principales - 3 cards seulement */}
        <div className="grid grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Montant Total Alloué</p>
                  <p className="text-2xl font-bold text-blue-600">{formatMRU(stats.budgetAlloue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Montant Dépensé</p>
                  <p className="text-2xl font-bold text-green-600">{formatMRU(stats.depensesEffectuees)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Reste à Consommer</p>
                  <p
                    className={`text-2xl font-bold ${stats.budgetAlloue - stats.depensesEffectuees < 0 ? "text-red-600" : "text-orange-600"}`}
                  >
                    {formatMRU(stats.budgetAlloue - stats.depensesEffectuees)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Analyse Budgétaire */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analyse Budgétaire</CardTitle>
              <div className="flex items-center space-x-4">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Budget par Rubrique */}
        <Card>
          <CardHeader>
            <CardTitle>Budget par Rubrique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {rubriques.map((rubrique, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{rubrique.nom}</h3>
                    <div className="text-right">
                      <p className="font-semibold">{formatMRU(rubrique.budgetAlloue)}</p>
                      <p className="text-sm text-gray-600">Budget alloué</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getProgressColor(rubrique.progression)} transition-all duration-300`}
                      style={{ width: `${rubrique.progression}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Dépensé</p>
                      <p className="font-semibold text-green-600">{formatMRU(rubrique.depense)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Disponible</p>
                      <p className={`font-semibold ${rubrique.disponible < 0 ? "text-red-600" : "text-blue-600"}`}>
                        {formatMRU(rubrique.disponible)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-medium">{rubrique.progression.toFixed(1)}% utilisé</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
