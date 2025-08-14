"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, FileText, Building2, Hash, Download, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Depense {
  id: number
  nom: string
  date: Date
  montant: number
  justificatif: string
  missionId: number
  mission?: {
    nom: string
  }
}

interface DepenseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  depense: Depense | null
  missionName: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
  }).format(amount)
}

export function DepenseDetailsModal({ isOpen, onClose, depense, missionName }: DepenseDetailsModalProps) {
  const { toast } = useToast()

  if (!depense) return null

  const handleDownloadJustificatif = () => {
    if (depense.justificatif) {
      // Si c'est un chemin local (commence par /uploads/)
      if (depense.justificatif.startsWith("/uploads/")) {
        const link = document.createElement("a")
        link.href = depense.justificatif
        link.download = `justificatif-${depense.nom}-${depense.id}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Téléchargement",
          description: "Le téléchargement du justificatif a commencé.",
        })
      } else if (depense.justificatif.startsWith("http")) {
        // Si c'est une URL externe
        window.open(depense.justificatif, "_blank")
      } else {
        toast({
          title: "Erreur",
          description: "Format de justificatif non supporté pour le téléchargement.",
          variant: "destructive",
        })
      }
    }
  }

  const handleViewJustificatif = () => {
    if (depense.justificatif) {
      if (depense.justificatif.startsWith("http") || depense.justificatif.startsWith("/uploads/")) {
        window.open(depense.justificatif, "_blank")
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ouvrir ce type de justificatif.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Détails de la Dépense
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-mono">{depense.id}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom de la dépense</label>
                  <p className="text-gray-900 font-semibold mt-1">{depense.nom}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{new Date(depense.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-bold text-lg">{formatCurrency(depense.montant)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Mission Associée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">{missionName}</p>
                  <p className="text-sm text-gray-500">ID Mission: {depense.missionId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Justificatif */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Justificatif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-900 break-all mb-3">{depense.justificatif}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadJustificatif}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewJustificatif}
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ouvrir
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
