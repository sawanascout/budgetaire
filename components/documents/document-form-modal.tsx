"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText } from "lucide-react"

type Mission = {
  id: number
  nom: string
}

type Rubrique = {
  id: number
  nom: string
}

type DocumentFormModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    nom: string
    type: string
    chemin: string
    categorie: string
    missionId?: number
    rubriqueId: number
    description?: string
  }) => void
  missions: Mission[]
  rubriques: Rubrique[]
}

export function DocumentFormModal({ isOpen, onClose, onSubmit, missions, rubriques }: DocumentFormModalProps) {
  const [formData, setFormData] = useState({
    categorie: "",
    missionId: "",
    description: "",
    rubriqueId: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !formData.categorie || !formData.rubriqueId) {
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)

    try {
      // Upload du fichier
      const uploadFormData = new FormData()
      uploadFormData.append("file", selectedFile)

      const uploadResponse = await fetch("/api/upload-busboy", {
        method: "POST",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload")
      }

      const uploadResult = await uploadResponse.json()

      // Soumission des données
      await onSubmit({
        nom: selectedFile.name,
        type: selectedFile.name.split(".").pop()?.toUpperCase() || "",
        chemin: uploadResult.filePath,
        categorie: formData.categorie,
        missionId: formData.missionId ? Number.parseInt(formData.missionId) : undefined,
        rubriqueId: Number.parseInt(formData.rubriqueId),
        description: formData.description,
      })

      // Reset du formulaire
      setFormData({
        categorie: "",
        missionId: "",
        description: "",
        rubriqueId: "",
      })
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  return (
    
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Téléverser un Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Fichier</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Glissez-déposez un fichier ici ou cliquez pour sélectionner</p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Sélectionner un fichier
              </Button>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <Select
              value={formData.categorie}
              onValueChange={(value) => setFormData({ ...formData, categorie: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                <SelectItem value="Justificatif">Justificatif</SelectItem>
                <SelectItem value="Paiement">Paiement</SelectItem>
                <SelectItem value="Procès-verbal">Procès-verbal</SelectItem>
                <SelectItem value="Rapport">Rapport</SelectItem>
                <SelectItem value="Contrat">Contrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

         

          <div className="space-y-2">
            <Label htmlFor="rubrique">Rubrique *</Label>
            <Select
              value={formData.rubriqueId}
              onValueChange={(value) => setFormData({ ...formData, rubriqueId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une rubrique" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                {rubriques.map((rubrique) => (
                  <SelectItem key={rubrique.id} value={rubrique.id.toString()}>
                    {rubrique.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              placeholder="Description du document..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !formData.categorie || !formData.rubriqueId || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Téléversement...
                </>
              ) : (
                "Téléverser"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
