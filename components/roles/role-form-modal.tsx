"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRole, updateRole } from "@/app/dashboard/roles/actions"
import { useToast } from "@/hooks/use-toast"

interface Role {
  id: number
  nom: string
  description: string
  utilisateurs: any[]
}

interface RoleFormModalProps {
  role?: Role | null
  isOpen: boolean
  onClose: () => void
}

export function RoleFormModal({ role, isOpen, onClose }: RoleFormModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (role) {
      setFormData({
        nom: role.nom,
        description: role.description,
      })
    } else {
      setFormData({
        nom: "",
        description: "",
      })
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      if (role) {
        result = await updateRole(role.id, formData)
      } else {
        result = await createRole(formData)
      }

      if (result.success) {
        toast({
          title: "Succès",
          description: role ? "Rôle modifié avec succès" : "Rôle créé avec succès",
        })
        onClose()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue",
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{role ? "Modifier le rôle" : "Créer un nouveau rôle"}</DialogTitle>
          <DialogDescription>
            {role
              ? "Modifiez les informations du rôle ci-dessous."
              : "Remplissez les informations pour créer un nouveau rôle."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom du rôle</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Administrateur"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du rôle et de ses responsabilités"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "En cours..." : role ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
