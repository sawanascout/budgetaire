"use client"

import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, Calendar, User, Hash, CheckCircle, AlertCircle } from "lucide-react"

// Define Mission type based on the table
type Mission = {
  date: string
  missionnaire: string
  montantParJour: number
  jours: number
  total: number
  modePaiement: string
  reference: string
  statut: string
}

type MissionDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  mission: Mission
}

export function MissionDetailsModal({ isOpen, onClose, mission }: MissionDetailsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validé":
        return "bg-green-50 text-green-700 border border-green-200"
      case "En cours":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "En attente":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"
      case "Rejeté":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Validé":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "En attente":
        return <AlertCircle className="w-4 h-4 mr-1" />
      default:
        return <Clock className="w-4 h-4 mr-1" />
    }
  }

  const DetailRow = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
      <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
        {label}:
      </p>
      <p className="text-gray-900 dark:text-gray-100 text-right">{value}</p>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            Détails de la mission
            <Badge className={getStatusColor(mission.statut) + " text-sm px-3 py-1.5 rounded-full"}>
              {getStatusIcon(mission.statut)}
              {mission.statut}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
            Informations complètes sur la mission sélectionnée
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Informations de base</h3>
           
            <DetailRow
              label="Missionnaire"
              value={mission.nomMissionnaire}
              icon={<User className="w-4 h-4" />}
            />
            <DetailRow
              label="Référence"
              value={mission.reference}
              icon={<Hash className="w-4 h-4" />}
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Détails financiers</h3>
            <DetailRow
              label="Montant par jour"
              value={`${mission.montantParJour} MRU`}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <DetailRow
              label="Nombre de jours"
              value={mission.nombreJours}
              icon={<Clock className="w-4 h-4" />}
            />
            <DetailRow
              label="Total"
              value={`${mission.total} MRU`}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <DetailRow
              label="Mode de paiement"
              value={mission.modePaiement}
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
