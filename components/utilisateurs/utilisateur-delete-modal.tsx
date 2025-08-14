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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertTriangle } from "lucide-react"
import { deleteUtilisateur } from "@/app/dashboard/utilisateurs/actions"
import { useToast } from "@/hooks/use-toast"

interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
}

interface UtilisateurDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  utilisateur: Utilisateur | null
}

export function UtilisateurDeleteModal({ isOpen, onClose, utilisateur }: UtilisateurDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!utilisateur) return

    setIsLoading(true)
    setError("")

    try {
      const result = await deleteUtilisateur(utilisateur.id)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Utilisateur supprimé avec succès",
        })
        onClose()
      } else {
        setError(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      setError("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Confirmer la suppression
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            {utilisateur && (
              <>
                <p>
                  Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                  <span className="font-semibold">
                    {utilisateur.prenom} {utilisateur.nom}
                  </span>{" "}
                  ({utilisateur.email}) ?
                </p>
                <p className="text-sm text-gray-600">
                  Cette action est irréversible. L'utilisateur ne pourra plus se connecter et toutes ses données seront
                  supprimées.
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
