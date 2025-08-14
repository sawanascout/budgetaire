"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createDepense, updateDepense } from "@/app/dashboard/depenses/actions"
import type { Mission } from "@prisma/client"
import { cn } from "@/lib/utils"

// Define Depense type based on exact schema
interface Depense {
  id: number
  nom: string
  date: Date
  montant: number
  justificatif: string
  missionId: number
  mission?: Mission
}

const formSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  date: z.coerce.date({
    errorMap: (issue, { defaultError }) => ({
      message: issue.code === "invalid_date" ? "Date invalide." : defaultError,
    }),
  }),
  montant: z.preprocess((val) => Number(val), z.number().min(0, { message: "Le montant doit être positif." })),
  justificatif: z.string().min(1, { message: "Le justificatif est requis." }),
  missionId: z.preprocess((val) => Number(val), z.number().min(1, { message: "Veuillez sélectionner une mission." })),
})

interface DepenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  depense: Depense | null
  missions: Mission[]
}

export function DepenseFormModal({ isOpen, onClose, onSuccess, depense, missions }: DepenseFormModalProps) {
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: depense?.nom || "",
      date: depense?.date ? new Date(depense.date) : new Date(),
      montant: depense?.montant || 0,
      justificatif: depense?.justificatif || "",
      missionId: depense?.missionId || undefined,
    },
  })

  useEffect(() => {
    if (depense) {
      form.reset({
        nom: depense.nom,
        date: new Date(depense.date),
        montant: depense.montant,
        justificatif: depense.justificatif,
        missionId: depense.missionId,
      })
      setSelectedFile(null)
    } else {
      form.reset({
        nom: "",
        date: new Date(),
        montant: 0,
        justificatif: "",
        missionId: undefined,
      })
      setSelectedFile(null)
    }
  }, [depense, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let justificatifUrl: string = values.justificatif

      if (selectedFile) {
        setUploading(true)
        try {
          const formData = new FormData()
          formData.append("file", selectedFile)

          const response = await fetch("/api/upload-busboy", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const result = await response.json()
          justificatifUrl = result.filePath
        } catch (uploadError) {
          console.error("Failed to upload file:", uploadError)
          toast({
            title: "Erreur d'upload",
            description: "Échec du téléchargement du justificatif.",
            variant: "destructive",
          })
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      const dataToSubmit = {
        ...values,
        justificatif: justificatifUrl,
      }

      if (depense) {
        await updateDepense(depense.id, dataToSubmit)
        toast({
          title: "Succès",
          description: "Dépense modifiée avec succès.",
        })
      } else {
        await createDepense(dataToSubmit)
        toast({
          title: "Succès",
          description: "Dépense ajoutée avec succès.",
        })
      }
      onSuccess()
    } catch (error: any) {
      console.error("Failed to save depense:", error)
      toast({
        title: "Erreur",
        description: error.message || "Échec de l'enregistrement de la dépense.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
    if (file) {
      form.setValue("justificatif", file.name)
      form.clearErrors("justificatif")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {depense ? "Modifier la Dépense" : "Ajouter une Nouvelle Dépense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nom" className="text-sm font-medium text-gray-700">
              Nom de la dépense
            </Label>
            <Input id="nom" {...form.register("nom")} placeholder="Ex: Hébergement formateurs" className="w-full" />
            {form.formState.errors.nom && <p className="text-red-500 text-sm">{form.formState.errors.nom.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", {
                setValueAs: (value) => (value ? new Date(value) : undefined),
              })}
              value={form.watch("date") instanceof Date ? form.watch("date").toISOString().split("T")[0] : ""}
              className="w-full"
            />
            {form.formState.errors.date && <p className="text-red-500 text-sm">{form.formState.errors.date.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="montant" className="text-sm font-medium text-gray-700">
              Montant (FCFA)
            </Label>
            <Input
              id="montant"
              type="number"
              step="0.01"
              {...form.register("montant")}
              placeholder="Ex: 25000"
              className="w-full"
            />
            {form.formState.errors.montant && (
              <p className="text-red-500 text-sm">{form.formState.errors.montant.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="justificatif" className="text-sm font-medium text-gray-700">
              Justificatif (requis)
            </Label>
            {!selectedFile && (
              <Input
                id="justificatif"
                {...form.register("justificatif")}
                placeholder="URL du justificatif ou sélectionnez un fichier"
                className="w-full"
              />
            )}
            <Input
              id="justificatif-file"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {form.formState.errors.justificatif && (
              <p className="text-red-500 text-sm">{form.formState.errors.justificatif.message}</p>
            )}
            {selectedFile && <p className="text-sm text-gray-500 mt-1">Fichier sélectionné: {selectedFile.name}</p>}
            {!selectedFile && depense?.justificatif && (
              <p className="text-sm text-gray-500 mt-1">Justificatif actuel: {depense.justificatif}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="missionId" className="text-sm font-medium text-gray-700">
              Mission associée
            </Label>
            <select
              id="missionId"
              {...form.register("missionId", { valueAsNumber: true })}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                form.formState.errors.missionId && "border-red-500",
              )}
            >
              <option value="">Sélectionner une mission</option>
              {missions.map((mission) => (
                <option key={mission.id} value={mission.id}>
                  {mission.nom}
                </option>
              ))}
            </select>
            {form.formState.errors.missionId && (
              <p className="text-red-500 text-sm">{form.formState.errors.missionId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Annuler
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
              {uploading
                ? "Téléchargement..."
                : form.formState.isSubmitting
                  ? "Enregistrement..."
                  : depense
                    ? "Modifier la dépense"
                    : "Ajouter la dépense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
