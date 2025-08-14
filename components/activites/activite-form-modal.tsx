"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ActiviteFormModalProps {
  isOpen: boolean
  onClose: () => void
  activite?: any
  rubriques: any[]
  onSuccess: (data: any) => void
}

export function ActiviteFormModal({ isOpen, onClose, activite, rubriques, onSuccess }: ActiviteFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titre: "",
    responsable: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    budgetPrevu: "",
    region: "",
    nombreParticipants: "",
    objectifs: "",
    resultatsAttendus: "",
    methodologie: "",
    rubriqueId: "",
  })

  useEffect(() => {
    if (activite) {
      setFormData({
        titre: activite.titre || "",
        responsable: activite.responsable || "",
        description: activite.description || "",
        dateDebut: activite.dateDebut ? new Date(activite.dateDebut).toISOString().split("T")[0] : "",
        dateFin: activite.dateFin ? new Date(activite.dateFin).toISOString().split("T")[0] : "",
        budgetPrevu: activite.budgetPrevu?.toString() || "",
        region: activite.region || "",
        nombreParticipants: activite.nombreParticipants?.toString() || "",
        objectifs: activite.objectifs || "",
        resultatsAttendus: activite.resultatsAttendus || "",
        methodologie: activite.methodologie || "",
        rubriqueId: activite.rubriqueId?.toString() || "",
      })
    } else {
      setFormData({
        titre: "",
        responsable: "",
        description: "",
        dateDebut: "",
        dateFin: "",
        budgetPrevu: "",
        region: "",
        nombreParticipants: "",
        objectifs: "",
        resultatsAttendus: "",
        methodologie: "",
        rubriqueId: "",
      })
    }
  }, [activite, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        budgetPrevu: Number.parseFloat(formData.budgetPrevu) || 0,
        nombreParticipants: formData.nombreParticipants ? Number.parseInt(formData.nombreParticipants) : null,
        rubriqueId: Number.parseInt(formData.rubriqueId),
        dateDebut: new Date(formData.dateDebut),
        dateFin: new Date(formData.dateFin),
      }

      await onSuccess(data)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle activité</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre et Responsable */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de l'activité *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => handleChange("titre", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                value={formData.responsable}
                onChange={(e) => handleChange("responsable", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Dates et Budget */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début *</Label>
              <Input
                id="dateDebut"
                type="date"
                value={formData.dateDebut}
                onChange={(e) => handleChange("dateDebut", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin *</Label>
              <Input
                id="dateFin"
                type="date"
                value={formData.dateFin}
                onChange={(e) => handleChange("dateFin", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetPrevu">Budget (MRU) *</Label>
              <Input
                id="budgetPrevu"
                type="number"
                value={formData.budgetPrevu}
                onChange={(e) => handleChange("budgetPrevu", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Région et Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region">Région *</Label>
             <Select value={formData.region} onValueChange={(value) => handleChange("region", value)}>
  <SelectTrigger className="bg-white">
    <SelectValue placeholder="Sélectionner une région" />
  </SelectTrigger>
 <SelectContent className="z-[9999] bg-white">
  <SelectItem value="Nouakchott">Nouakchott</SelectItem>
  <SelectItem value="Nouadhibou">Nouadhibou</SelectItem>
  <SelectItem value="Rosso">Rosso</SelectItem>
  <SelectItem value="Kaédi">Kaédi</SelectItem>
  <SelectItem value="Kiffa">Kiffa</SelectItem>
  <SelectItem value="Atar">Atar</SelectItem>
  <SelectItem value="Zouerate">Zouerate</SelectItem>
  <SelectItem value="Aleg">Aleg</SelectItem>
  <SelectItem value="Boutilimit">Boutilimit</SelectItem>
  <SelectItem value="Tidjikja">Tidjikja</SelectItem>
  <SelectItem value="Nema">Nema</SelectItem>
  <SelectItem value="Aioun">Aioun</SelectItem>
  <SelectItem value="Selibaby">Selibaby</SelectItem>
  <SelectItem value="Mbout">Mbout</SelectItem>
  <SelectItem value="Akjoujt">Akjoujt</SelectItem>
</SelectContent>

</Select>

            </div>
            <div className="space-y-2">
              <Label htmlFor="nombreParticipants">Nombre de participants</Label>
              <Input
                id="nombreParticipants"
                type="number"
                value={formData.nombreParticipants}
                onChange={(e) => handleChange("nombreParticipants", e.target.value)}
              />
            </div>
          </div>

          {/* Objectifs */}
          <div className="space-y-2">
            <Label htmlFor="objectifs">Objectifs</Label>
            <Textarea
              id="objectifs"
              value={formData.objectifs}
              onChange={(e) => handleChange("objectifs", e.target.value)}
              rows={3}
            />
          </div>

          {/* Résultats attendus */}
          <div className="space-y-2">
            <Label htmlFor="resultatsAttendus">Résultats attendus</Label>
            <Textarea
              id="resultatsAttendus"
              value={formData.resultatsAttendus}
              onChange={(e) => handleChange("resultatsAttendus", e.target.value)}
              rows={3}
            />
          </div>

          {/* Méthodologie */}
          <div className="space-y-2">
            <Label htmlFor="methodologie">Méthodologie</Label>
            <Textarea
              id="methodologie"
              value={formData.methodologie}
              onChange={(e) => handleChange("methodologie", e.target.value)}
              rows={3}
            />
          </div>

          

          {/* Boutons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
