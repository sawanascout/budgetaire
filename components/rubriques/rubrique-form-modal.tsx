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
import { createRubrique, updateRubrique, type Rubrique } from "../../app/dashboard/rubriques/actions"
import { toast } from "sonner"
import { Layers } from "lucide-react"

interface RubriqueFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rubrique: Rubrique | null
  isEditing: boolean
  onSuccess: () => void
}

export function RubriqueFormModal({ open, onOpenChange, rubrique, isEditing, onSuccess }: RubriqueFormModalProps) {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (rubrique && isEditing) {
      setFormData({
        nom: rubrique.nom,
        description: rubrique.description,
      })
    } else {
      setFormData({
        nom: "",
        description: "",
      })
    }
  }, [rubrique, isEditing, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let result
      if (isEditing && rubrique) {
        result = await updateRubrique(rubrique.id, formData)
      } else {
        result = await createRubrique(formData)
      }

      if (result.success) {
        toast.success(isEditing ? "Rubrique modifiée avec succès" : "Rubrique créée avec succès")
        onSuccess()
      } else {
        toast.error(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      toast.error("Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {isEditing ? "Modifier la rubrique" : "Nouvelle rubrique"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de la rubrique."
              : "Créez une nouvelle rubrique pour classifier vos documents."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom de la rubrique"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la rubrique"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : isEditing ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
