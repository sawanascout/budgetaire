"use client"

import { useState, useEffect } from "react"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActiviteFormModal } from "@/components/activites/activite-form-modal"
import { ActiviteDetailsModal } from "@/components/activites/activite-details-modal"
import { ActiviteDeleteModal } from "@/components/activites/activite-delete-modal"
import { ActiviteTable } from "@/components/activites/activite-table"
import { getActivites, createActivite, updateActivite, deleteActivite, getRubriques } from "./actions"
import { useToast } from "@/hooks/use-toast"

// Define Activite and Rubrique types for client-side usage
type Activite = {
  id: number
  titre: string
  description: string
  budgetPrevu: string
  budgetConsomme: string
  statut: string
  missionId: number
  rubriqueId: number
  mission: {
    id: number
    nom: string
  }
  rubrique: {
    id: number
    nom: string
  }
}

type Rubrique = {
  id: number
  nom: string
}

export default function ActivitesPage() {
  const { toast } = useToast()
  const [activites, setActivites] = useState<Activite[]>([])
  const [rubriques, setRubriques] = useState<Rubrique[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedActivite, setSelectedActivite] = useState<Activite | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log("Fetching data...")
    setLoading(true)

    try {
      const [activitesRes, rubriquesRes] = await Promise.all([getActivites(), getRubriques()])

      if (activitesRes.success && activitesRes.data) {
        console.log("Activities loaded:", activitesRes.data.length)
        setActivites(activitesRes.data)
      } else {
        console.error("Failed to load activities:", activitesRes.error)
        toast({
          title: "Erreur",
          description: activitesRes.error || "Échec du chargement des activités.",
          variant: "destructive",
        })
      }

      if (rubriquesRes.success && rubriquesRes.data) {
        console.log("Rubriques loaded:", rubriquesRes.data.length)
        setRubriques(rubriquesRes.data)
      } else {
        console.error("Failed to load rubriques:", rubriquesRes.error)
        toast({
          title: "Erreur",
          description: rubriquesRes.error || "Échec du chargement des rubriques.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivite = () => {
    console.log("Opening add activity modal")
    setSelectedActivite(null)
    setIsFormModalOpen(true)
  }

  const handleEditActivite = (activite: Activite) => {
    console.log("Opening edit activity modal for:", activite.id)
    setSelectedActivite(activite)
    setIsFormModalOpen(true)
  }

  const handleViewDetails = (activite: Activite) => {
    console.log("Opening details modal for:", activite.id)
    setSelectedActivite(activite)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteActivite = (activite: Activite) => {
    console.log("Opening delete modal for:", activite.id)
    setSelectedActivite(activite)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitForm = async (data: Omit<Activite, "id" | "mission" | "rubrique" | "missionId">) => {
    console.log("Submitting form with data:", data)

    try {
      let res
      if (selectedActivite) {
        console.log("Updating activity:", selectedActivite.id)
        res = await updateActivite(selectedActivite.id, data)
        if (res.success) {
          toast({
            title: "Succès",
            description: "Activité modifiée avec succès.",
          })
        } else {
          console.error("Update failed:", res.error)
          toast({
            title: "Erreur",
            description: res.error || "Échec de la modification de l'activité.",
            variant: "destructive",
          })
        }
      } else {
        console.log("Creating new activity")
        res = await createActivite(data)
        if (res.success) {
          toast({
            title: "Succès",
            description: "Activité ajoutée avec succès.",
          })
        } else {
          console.error("Create failed:", res.error)
          toast({
            title: "Erreur",
            description: res.error || "Échec de l'ajout de l'activité.",
            variant: "destructive",
          })
        }
      }

      if (res.success) {
        setIsFormModalOpen(false)
        await fetchData() // Re-fetch data to update the table
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedActivite) {
      console.log("Deleting activity:", selectedActivite.id)

      try {
        const res = await deleteActivite(selectedActivite.id)
        if (res.success) {
          toast({
            title: "Succès",
            description: "Activité supprimée avec succès.",
          })
          setIsDeleteModalOpen(false)
          await fetchData() // Re-fetch data to update the table
        } else {
          console.error("Delete failed:", res.error)
          toast({
            title: "Erreur",
            description: res.error || "Échec de la suppression de l'activité.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Delete error:", error)
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des activités...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card className="bg-white shadow-lg rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">Gestion des Activités ({activites.length})</CardTitle>
          <Button
            onClick={handleAddActivite}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={rubriques.length === 0}
          >
            <PlusCircle className="h-5 w-5" />
            Ajouter une Activité
          </Button>
        </CardHeader>
        <CardContent>
          {rubriques.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Aucune rubrique disponible.</p>
              <p className="text-sm text-gray-400">
                Veuillez créer au moins une rubrique avant d'ajouter des activités.
              </p>
            </div>
          ) : (
            <ActiviteTable
              activites={activites}
              onEdit={handleEditActivite}
              onView={handleViewDetails}
              onDelete={handleDeleteActivite}
            />
          )}
        </CardContent>
      </Card>

      {isFormModalOpen && rubriques.length > 0 && (
        <ActiviteFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          activite={selectedActivite}
          onSubmit={handleSubmitForm}
          rubriques={rubriques}
        />
      )}

      {isDetailsModalOpen && selectedActivite && (
        <ActiviteDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          activite={selectedActivite}
        />
      )}

      {isDeleteModalOpen && selectedActivite && (
        <ActiviteDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          activite={selectedActivite}
        />
      )}
    </div>
  )
}
