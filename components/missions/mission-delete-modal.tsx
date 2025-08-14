"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

// Define Mission type (should match the one in page.tsx)
type Mission = {
  id: number
  nom: string
  dateDebut: Date
  dateFin: Date
  duree: number
  budget: number
  budgetConsomme: number
  modePaiement: string
  statutValidation: string
  activitesCount: number
  depensesCount: number
  progression: number
}

type MissionDeleteModalProps = {
  isOpen: boolean
  onClose: () => void
  mission: Mission
  onConfirmDelete: () => void
}

export function MissionDeleteModal({ isOpen, onClose, mission, onConfirmDelete }: MissionDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-6 h-6" /> Confirmer la suppression
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la mission "
            <span className="font-semibold text-gray-900">{mission.nom}</span>" ? Cette action est irréversible et
            supprimera également toutes les activités et dépenses associées.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
