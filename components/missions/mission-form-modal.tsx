"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Mission = {
  id: number
  date: string
  nomMissionnaire: string
  montantParJour: number
  nombreJours: number
  modePaiement: string
  reference: string
  statut: string
}

interface MissionFormModalProps {
  isOpen: boolean
  onClose: () => void
  mission?: Mission | null
  onSubmit: (data: any) => void
}

export function MissionFormModal({ isOpen, onClose, mission, onSubmit }: MissionFormModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    nomMissionnaire: "",
    montantParJour: "",
    nombreJours: "",
    modePaiement: "",
    reference: "",
    statut: "En Attente",
  })

  useEffect(() => {
    if (mission) {
      setFormData({
        date: new Date(mission.date).toISOString().split("T")[0],
        nomMissionnaire: mission.nomMissionnaire,
        montantParJour: mission.montantParJour.toString(),
        nombreJours: mission.nombreJours.toString(),
        modePaiement: mission.modePaiement,
        reference: mission.reference,
        statut: mission.statut,
      })
    } else {
      setFormData({
        date: "",
        nomMissionnaire: "",
        montantParJour: "",
        nombreJours: "",
        modePaiement: "",
        reference: "",
        statut: "En Attente",
      })
    }
  }, [mission])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData = {
      date: new Date(formData.date),
      nomMissionnaire: formData.nomMissionnaire,
      montantParJour: Number.parseFloat(formData.montantParJour),
      nombreJours: Number.parseInt(formData.nombreJours),
      modePaiement: formData.modePaiement,
      reference: formData.reference,
      statut: formData.statut,
    }

    onSubmit(submitData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateTotal = () => {
    const montant = Number.parseFloat(formData.montantParJour) || 0
    const jours = Number.parseInt(formData.nombreJours) || 0
    return montant * jours
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mission ? "Modifier la Mission" : "Nouvelle Mission"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="nomMissionnaire">Nom du Missionnaire *</Label>
            <Input
              id="nomMissionnaire"
              value={formData.nomMissionnaire}
              onChange={(e) => handleChange("nomMissionnaire", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="montantParJour">Montant/Jour (MRU) *</Label>
            <Input
              id="montantParJour"
              type="number"
              step="0.01"
              value={formData.montantParJour}
              onChange={(e) => handleChange("montantParJour", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="nombreJours">Nombre de jours *</Label>
            <Input
              id="nombreJours"
              type="number"
              value={formData.nombreJours}
              onChange={(e) => handleChange("nombreJours", e.target.value)}
              required
            />
          </div>

          {formData.montantParJour && formData.nombreJours && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm font-medium">Total calculé</Label>
              <p className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat("fr-FR").format(calculateTotal())} MRU
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="modePaiement">Mode de paiement *</Label>
            <Select value={formData.modePaiement} onValueChange={(value) => handleChange("modePaiement", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le mode de paiement" />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                <SelectItem value="Virement">Virement</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Carte">Carte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reference">Référence *</Label>
            <Input
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="statut">Statut</Label>
            <Select value={formData.statut} onValueChange={(value) => handleChange("statut", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999] bg-white">
                <SelectItem value="En Attente">En Attente</SelectItem>
                <SelectItem value="En Cours">En Cours</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{mission ? "Modifier" : "Enregistrer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
