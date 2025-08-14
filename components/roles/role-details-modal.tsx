"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Shield } from "lucide-react"

interface Role {
  id: number
  nom: string
  description: string
  utilisateurs: any[]
}

interface RoleDetailsModalProps {
  role: Role | null
  isOpen: boolean
  onClose: () => void
}

export function RoleDetailsModal({ role, isOpen, onClose }: RoleDetailsModalProps) {
  if (!role) return null

  const getRoleColor = (nom: string) => {
    switch (nom.toLowerCase()) {
      case "administrateur":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "comptable":
        return "bg-green-100 text-green-800 border-green-200"
      case "gestionnaire de mission":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "assistant":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Détails du rôle
          </DialogTitle>
          <DialogDescription>Informations détaillées sur le rôle sélectionné</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRoleColor(role.nom)}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{role.nom}</h3>
              <Badge className={getRoleColor(role.nom)}>ID: {role.id}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{role.description}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Utilisateurs assignés</h4>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Users className="w-3 h-3 mr-1" />
                  {role.utilisateurs.length} utilisateur(s)
                </Badge>
              </div>
            </div>

            {role.utilisateurs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Liste des utilisateurs</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {role.utilisateurs.map((utilisateur) => (
                    <div key={utilisateur.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {utilisateur.prenom?.[0]}
                          {utilisateur.nom?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {utilisateur.prenom} {utilisateur.nom}
                        </p>
                        <p className="text-xs text-gray-500">{utilisateur.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
