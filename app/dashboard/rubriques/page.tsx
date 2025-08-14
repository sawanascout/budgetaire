"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { RubriqueTable } from "@/components/rubriques/rubrique-table"
import { RubriqueFormModal } from "@/components/rubriques/rubrique-form-modal"
import { RubriqueDetailsModal } from "@/components/rubriques/rubrique-details-modal"
import { RubriqueDeleteModal } from "@/components/rubriques/rubrique-delete-modal"
import { getRubriques, type Rubrique } from "./actions"
import { toast } from "sonner"

export default function RubriquesPage() {
  const [rubriques, setRubriques] = useState<Rubrique[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedRubrique, setSelectedRubrique] = useState<Rubrique | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const loadRubriques = async () => {
    try {
      setLoading(true)
      const data = await getRubriques()
      setRubriques(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des rubriques")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRubriques()
  }, [])

  const handleAdd = () => {
    setSelectedRubrique(null)
    setIsEditing(false)
    setIsFormOpen(true)
  }

  const handleEdit = (rubrique: Rubrique) => {
    setSelectedRubrique(rubrique)
    setIsEditing(true)
    setIsFormOpen(true)
  }

  const handleView = (rubrique: Rubrique) => {
    setSelectedRubrique(rubrique)
    setIsDetailsOpen(true)
  }

  const handleDelete = (rubrique: Rubrique) => {
    setSelectedRubrique(rubrique)
    setIsDeleteOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedRubrique(null)
    setIsEditing(false)
    loadRubriques()
  }

  const handleDeleteSuccess = () => {
    setIsDeleteOpen(false)
    setSelectedRubrique(null)
    loadRubriques()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rubriques</h2>
          <p className="text-muted-foreground">Gérez les rubriques de classification des documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une rubrique
          </Button>
        </div>
      </div>

      <RubriqueTable
        rubriques={rubriques}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      <RubriqueFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rubrique={selectedRubrique}
        isEditing={isEditing}
        onSuccess={handleFormSuccess}
      />

      <RubriqueDetailsModal open={isDetailsOpen} onOpenChange={setIsDetailsOpen} rubrique={selectedRubrique} />

      <RubriqueDeleteModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        rubrique={selectedRubrique}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
