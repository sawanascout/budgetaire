"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Depense {
  id: number
  nom: string
  date: Date
  montant: number
  justificatif: string
  missionId: number
}

interface DepenseDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  depense: Depense | null
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount)
}

export function DepenseDeleteModal({ isOpen, onClose, onConfirm, depense }: DepenseDeleteModalProps) {
  if (!depense) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Confirmer la Suppression
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Détails de la dépense à supprimer :</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID :</span>
                <span className="font-mono">{depense.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nom :</span>
                <span className="font-semibold">{depense.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date :</span>
                <span>{new Date(depense.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant :</span>
                <span className="font-bold text-green-600">{formatCurrency(depense.montant)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
