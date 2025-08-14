"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, Edit, Trash2, Eye, Download, RefreshCw } from "lucide-react"
import { DepenseFormModal } from "@/components/depenses/depense-form-modal"
import { DepenseDetailsModal } from "@/components/depenses/depense-details-modal"
import { DepenseDeleteModal } from "@/components/depenses/depense-delete-modal"
import { getDepenses, deleteDepense, type DepenseClient } from "@/app/dashboard/depenses/actions"
import type { Mission } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DepenseTableProps {
  initialDepenses: DepenseClient[]
  missions: Mission[]
  onRefresh: () => void
}

export function DepenseTable({ initialDepenses, missions, onRefresh }: DepenseTableProps) {
  const [depenses, setDepenses] = useState<DepenseClient[]>(initialDepenses)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDepense, setSelectedDepense] = useState<DepenseClient | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    setDepenses(initialDepenses)
  }, [initialDepenses])

  const fetchDepenses = async () => {
    setLoading(true)
    try {
      const depensesData = await getDepenses()
      setDepenses(depensesData)
      onRefresh()
    } catch (err) {
      console.error("Failed to fetch depenses:", err)
      toast({
        title: "Erreur",
        description: "Échec du chargement des dépenses.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDepense = () => {
    setSelectedDepense(null)
    setIsFormModalOpen(true)
  }

  const handleEditDepense = (depense: DepenseClient) => {
    setSelectedDepense(depense)
    setIsFormModalOpen(true)
  }

  const handleViewDetails = (depense: DepenseClient) => {
    setSelectedDepense(depense)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteDepense = (depense: DepenseClient) => {
    setSelectedDepense(depense)
    setIsDeleteModalOpen(true)
  }

  const handleDownloadJustificatif = (depense: DepenseClient) => {
    if (depense.justificatif) {
      // Si c'est un chemin local (commence par /uploads/)
      if (depense.justificatif.startsWith("/uploads/")) {
        const link = document.createElement("a")
        link.href = depense.justificatif
        link.download = `justificatif-${depense.nom}-${depense.id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (depense.justificatif.startsWith("http")) {
        // Si c'est une URL externe
        window.open(depense.justificatif, "_blank")
      } else {
        toast({
          title: "Erreur",
          description: "Format de justificatif non supporté pour le téléchargement.",
          variant: "destructive",
        })
      }
    }
  }

  const confirmDelete = async () => {
    if (selectedDepense) {
      try {
        await deleteDepense(selectedDepense.id)
        toast({
          title: "Succès",
          description: "Dépense supprimée avec succès.",
        })
        setIsDeleteModalOpen(false)
        fetchDepenses()
      } catch (err) {
        console.error("Failed to delete depense:", err)
        toast({
          title: "Erreur",
          description: "Échec de la suppression de la dépense.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredDepenses = depenses.filter(
    (depense) =>
      depense.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      depense.mission?.nom?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestion des Dépenses</h2>
        <div className="flex gap-2">
          <Button
            onClick={fetchDepenses}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={handleAddDepense} className="bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter une Dépense
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher une dépense par nom ou mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-full bg-white">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Nom</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Date</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Montant (FCFA)</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Mission</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Justificatif</TableHead>
              <TableHead className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepenses.length > 0 ? (
              filteredDepenses.map((depense) => (
                <TableRow key={depense.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <TableCell className="py-3 px-4 text-sm text-gray-700">{depense.nom}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700">
                    {format(new Date(depense.date), "dd/MM/yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700 font-medium text-green-600">
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(depense.montant)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700">{depense.mission?.nom || "N/A"}</TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700">
                    {depense.justificatif ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadJustificatif(depense)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    ) : (
                      "Aucun"
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-sm text-gray-700 flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewDetails(depense)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditDepense(depense)}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteDepense(depense)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                  Aucune dépense trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DepenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchDepenses}
        depense={selectedDepense}
        missions={missions}
      />

      <DepenseDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        depense={selectedDepense}
        missionName={selectedDepense?.mission?.nom || "N/A"}
      />

      <DepenseDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        depense={selectedDepense}
      />
    </div>
  )
}
