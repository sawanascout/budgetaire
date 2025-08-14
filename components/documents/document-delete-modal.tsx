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
import { FileText, Trash2 } from "lucide-react"

type Document = {
  id: number
  nom: string
  type: string
  chemin: string
  activiteId: number
  rubriqueId: number
  activite: {
    id: number
    titre: string
    mission: {
      id: number
      nom: string
    }
  }
  rubrique: {
    id: number
    nom: string
  }
}

type DocumentDeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  document: Document
  onConfirmDelete: () => void
}

export function DocumentDeleteModal({ isOpen, onClose, document, onConfirmDelete }: DocumentDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirmDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>Supprimer le document</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Êtes-vous sûr de vouloir supprimer le document{" "}
              <span className="font-semibold text-gray-900">"{document.nom}"</span> ?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Type: {document.type}</span>
              </div>
              <div className="text-sm text-gray-600">Activité: {document.activite.titre}</div>
              <div className="text-sm text-gray-600">Rubrique: {document.rubrique.nom}</div>
            </div>
            <p className="text-red-600 font-medium">
              Cette action est irréversible et supprimera définitivement le document du système.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Trash2 className="w-4 h-4 mr-2 animate-pulse" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
