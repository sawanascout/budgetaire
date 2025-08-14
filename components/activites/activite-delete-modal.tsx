"use client"

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

type ActiviteDeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  activite: Activite
}

export function ActiviteDeleteModal({ isOpen, onClose, onConfirm, activite }: ActiviteDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px] p-6 rounded-xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer l'activité{" "}
            <span className="font-semibold text-gray-900">"{activite.titre}"</span> ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end gap-3 pt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="h-11 px-6 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
