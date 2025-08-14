"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Folder, Tag, File, ImageIcon, FileSpreadsheet, Archive } from "lucide-react"

type Document = {
  id: number
  nom: string
  type: string
  chemin: string
  activiteId: number
  rubriqueId: number
  activite: {
    id: number
    titre: string
    mission: {
      id: number
      nom: string
    }
  }
  rubrique: {
    id: number
    nom: string
  }
}

type DocumentDetailsModalProps = {
  isOpen: boolean
  onClose: () => void
  document: Document
}

export function DocumentDetailsModal({ isOpen, onClose, document: doc }: DocumentDetailsModalProps) {
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-600" />
      case "docx":
      case "doc":
        return <FileText className="w-8 h-8 text-blue-600" />
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-8 h-8 text-green-600" />
      case "zip":
      case "rar":
        return <Archive className="w-8 h-8 text-purple-600" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-8 h-8 text-orange-600" />
      default:
        return <File className="w-8 h-8 text-gray-600" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800"
      case "docx":
      case "doc":
        return "bg-blue-100 text-blue-800"
      case "xlsx":
      case "xls":
        return "bg-green-100 text-green-800"
      case "zip":
      case "rar":
        return "bg-purple-100 text-purple-800"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = () => {
    const link = window.document.createElement("a")
    link.href = doc.chemin
    link.download = doc.nom
    link.target = "_blank"
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const handlePreview = () => {
    window.open(doc.chemin, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            {getFileIcon(doc.type)}
            <div>
              <div className="text-xl font-bold text-gray-900">{doc.nom}</div>
              <div className="text-sm text-gray-500 font-normal">Détails du document</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type de fichier:</span>
                    <Badge className={getTypeColor(doc.type)} variant="secondary">
                      {doc.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">ID Document:</span>
                    <span className="text-sm text-gray-900 font-mono">#{doc.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Classification</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Folder className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.activite.titre}</div>
                      <div className="text-xs text-gray-500">Mission: {doc.activite.mission.nom}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{doc.rubrique.nom}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Document disponible pour téléchargement</div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                className="hover:bg-blue-50 hover:text-blue-600 bg-transparent"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </Button>
              <Button
                variant="outline"
                className="hover:bg-green-50 hover:text-green-600 bg-transparent"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </Button>
              <Button onClick={onClose}>Fermer</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
