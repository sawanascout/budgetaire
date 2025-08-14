"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteRubrique, type Rubrique } from "../../app/dashboard/rubriques/actions"
import { toast } from "sonner"

interface RubriqueDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rubrique: Rubrique | null
  onSuccess: () => void
}

export function RubriqueDeleteModal({ open, onOpenChange, rubrique, onSuccess }: RubriqueDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!rubrique) return

    setIsDeleting(true)
    try {
      const result = await deleteRubrique(rubrique.id)
      if (result.success) {
        toast.success("Rubrique supprimée avec succès")
        onSuccess()
      } else {
        toast.error(result.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!rubrique) return null

  const hasDocuments = (rubrique._count?.documents || 0) > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la rubrique</AlertDialogTitle>
          <AlertDialogDescription>
            {hasDocuments ? (
              <>
                Cette rubrique contient <strong>{rubrique._count?.documents} document(s)</strong>. Vous ne pouvez pas la
                supprimer tant qu'elle contient des documents. Veuillez d'abord supprimer ou déplacer tous les documents
                associés.
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir supprimer la rubrique <strong>"{rubrique.nom}"</strong> ? Cette action est
                irréversible.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          {!hasDocuments && (
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
