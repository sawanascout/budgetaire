"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { createUtilisateur, updateUtilisateur, getRoles } from "@/app/dashboard/utilisateurs/actions"
import { useToast } from "@/hooks/use-toast"

interface Role {
  id: number
  nom: string
  description: string
}

interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  roles: Role[]
}

interface UtilisateurFormModalProps {
  isOpen: boolean
  onClose: () => void
  utilisateur?: Utilisateur | null
  isEditing?: boolean
}

export function UtilisateurFormModal({ isOpen, onClose, utilisateur, isEditing = false }: UtilisateurFormModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    confirmMotDePasse: "",
    roleIds: [] as number[],
  })
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      loadRoles()
      if (isEditing && utilisateur) {
        setFormData({
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          email: utilisateur.email,
          motDePasse: "",
          confirmMotDePasse: "",
          roleIds: utilisateur.roles.map((role) => role.id),
        })
      } else {
        setFormData({
          nom: "",
          prenom: "",
          email: "",
          motDePasse: "",
          confirmMotDePasse: "",
          roleIds: [],
        })
      }
      setError("")
    }
  }, [isOpen, isEditing, utilisateur])

  const loadRoles = async () => {
    try {
      const rolesData = await getRoles()
      setRoles(rolesData)
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      setError("Tous les champs obligatoires doivent être remplis")
      setIsLoading(false)
      return
    }

    if (!isEditing && !formData.motDePasse.trim()) {
      setError("Le mot de passe est obligatoire")
      setIsLoading(false)
      return
    }

    if (formData.motDePasse && formData.motDePasse !== formData.confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (formData.motDePasse && formData.motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      let result
      if (isEditing && utilisateur) {
        result = await updateUtilisateur(utilisateur.id, {
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim(),
          motDePasse: formData.motDePasse.trim() || undefined,
          roleIds: formData.roleIds,
        })
      } else {
        result = await createUtilisateur({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim(),
          motDePasse: formData.motDePasse.trim(),
          roleIds: formData.roleIds,
        })
      }

      if (result.success) {
        toast({
          title: "Succès",
          description: isEditing ? "Utilisateur modifié avec succès" : "Utilisateur créé avec succès",
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

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: checked ? [...prev.roleIds, roleId] : prev.roleIds.filter((id) => id !== roleId),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
                placeholder="Prénom de l'utilisateur"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Nom de l'utilisateur"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motDePasse">{isEditing ? "Nouveau mot de passe" : "Mot de passe *"}</Label>
              <div className="relative">
                <Input
                  id="motDePasse"
                  type={showPassword ? "text" : "password"}
                  value={formData.motDePasse}
                  onChange={(e) => setFormData((prev) => ({ ...prev, motDePasse: e.target.value }))}
                  placeholder={isEditing ? "Laisser vide pour ne pas changer" : "••••••••"}
                  required={!isEditing}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmMotDePasse">
                {isEditing ? "Confirmer le nouveau mot de passe" : "Confirmer le mot de passe *"}
              </Label>
              <div className="relative">
                <Input
                  id="confirmMotDePasse"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmMotDePasse}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmMotDePasse: e.target.value }))}
                  placeholder="••••••••"
                  required={!isEditing && formData.motDePasse.length > 0}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Rôles</Label>
            <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto border rounded-md p-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={formData.roleIds.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`role-${role.id}`} className="text-sm font-medium cursor-pointer">
                      {role.nom}
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
