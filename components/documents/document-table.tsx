"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  File,
  ImageIcon,
  FileSpreadsheet,
  Archive,
  Folder,
} from "lucide-react"

// Define Document type (should match the one in page.tsx)
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

type DocumentTableProps = {
  documents: Document[]
  onEdit: (document: Document) => void
  onView: (document: Document) => void
  onDelete: (document: Document) => void
}

export function DocumentTable({ documents, onEdit, onView, onDelete }: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("Tous")

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.activite.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.rubrique.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "Tous" || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600" />
      case "docx":
      case "doc":
        return <FileText className="w-5 h-5 text-blue-600" />
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-5 h-5 text-green-600" />
      case "zip":
      case "rar":
        return <Archive className="w-5 h-5 text-purple-600" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="w-5 h-5 text-orange-600" />
      default:
        return <File className="w-5 h-5 text-gray-600" />
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

  const handleDownload = (doc: Document) => {
    // Create a link element and trigger download
    const link = window.document.createElement("a")
    link.href = doc.chemin
    link.download = doc.nom
    link.target = "_blank"
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
  }

  const uniqueTypes = [...new Set(documents.map((d) => d.type))]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Liste des Documents</CardTitle>
            <CardDescription>Gérez et organisez tous vos documents par activité et rubrique</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-300 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedType}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType("Tous")}>Tous les types</DropdownMenuItem>
                {uniqueTypes.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => setSelectedType(type)}>
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Document</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Activité</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Mission</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Rubrique</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <p className="font-semibold text-gray-900">{doc.nom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getTypeColor(doc.type)} variant="secondary">
                      {doc.type}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{doc.activite.titre}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{doc.activite.mission.nom}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-900">{doc.rubrique.nom}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => onView(doc)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => onEdit(doc)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="text-blue-600" onClick={() => onView(doc)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600" onClick={() => handleDownload(doc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-orange-600" onClick={() => onEdit(doc)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onDelete(doc)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredDocuments.length === 0 && <div className="text-center py-8 text-gray-500">Aucun document trouvé.</div>}
      </CardContent>
    </Card>
  )
}
