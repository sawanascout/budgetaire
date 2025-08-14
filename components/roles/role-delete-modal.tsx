"use client"

import { useState } from "react"
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
import { AlertTriangle, Users } from "lucide-react"
import { deleteRole } from "@/app/dashboard/roles/actions"
import { useToast } from "@/hooks/use-toast"

interface Role {
  id: number
  nom: string
  description: string
  utilisateurs: any[]
}

interface RoleDeleteModalProps {
  role: Role | null
  isOpen: boolean
  onClose: () => void
}

export function RoleDeleteModal({ role, isOpen, onClose }: RoleDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!role) return null

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteRole(role.id)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Rôle supprimé avec succès",
        })
        onClose()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de supprimer le rôle",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasUsers = role.utilisateurs.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le rôle
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce rôle ?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{role.nom}</h4>
            <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Users className="w-3 h-3 mr-1" />
                {role.utilisateurs.length} utilisateur(s)
              </Badge>
            </div>
          </div>

          {hasUsers && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Attention</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Ce rôle est assigné à {role.utilisateurs.length} utilisateur(s). Vous ne pouvez pas supprimer un rôle
                qui a des utilisateurs assignés.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading || hasUsers}>
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
