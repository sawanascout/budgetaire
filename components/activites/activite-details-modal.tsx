"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

type ActiviteDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  activite: Activite
}

export function ActiviteDetailsModal({ isOpen, onClose, activite }: ActiviteDetailsModalProps) {
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "En cours":
        return "bg-blue-100 text-blue-800"
      case "Terminé":
        return "bg-green-100 text-green-800"
      case "Planifié":
        return "bg-yellow-100 text-yellow-800"
      case "Suspendu":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] p-6 rounded-xl shadow-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {activite.titre}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Informations détaillées sur l'activité sélectionnée.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Statut */}
          <div className="flex justify-end">
            <Badge className={getStatusColor(activite.statut)}>
              {activite.statut}
            </Badge>
          </div>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900 mt-1">{activite.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
               
                <div>
                  <label className="text-sm font-medium text-gray-600">Rubrique</label>
                  <p className="text-gray-900">{activite.rubrique?.nom}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations budgétaires */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                Informations budgétaires
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Budget Prévu</label>
                <p className="text-gray-900 font-semibold">{activite.budgetPrevu}</p>
              </div>
             
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
