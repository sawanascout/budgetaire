"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  File,
  ImageIcon,
  FileSpreadsheet,
  Archive,
} from "lucide-react"
import { DocumentFormModal } from "@/components/documents/document-form-modal"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  getDocuments,
  getDocumentStats,
  getMissions,
  getRubriques,
  createDocument,
  updateDocumentStatus,
} from "./actions"
import toast from "react-hot-toast"

type Document = {
  id: number
  nom: string
  type: string
  chemin: string
  categorie: string
  statut: string
  description?: string
  createdAt: string
  par: string
  activite?: {
    titre: string
  }
  mission?: {
    nom: string
  }
  rubrique?: {
    nom: string
  }
}

type Mission = {
  id: number
  nom: string
}

type Rubrique = {
  id: number
  nom: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [rubriques, setRubriques] = useState<Rubrique[]>([])
  const [stats, setStats] = useState({
    total: 0,
    valides: 0,
    enAttente: 0,
    rejetes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Toutes catégories")
  const [selectedStatus, setSelectedStatus] = useState("Tous statuts")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [documentsResult, statsResult, missionsData, rubriquesData] = await Promise.all([
        getDocuments(),
        getDocumentStats(),
        getMissions(),
        getRubriques(),
      ])

      console.log("Documents result:", documentsResult)

      if (documentsResult.success) {
        setDocuments(documentsResult.data as Document[])
      } else {
        console.error("Error loading documents:", documentsResult.error)
        toast.error(documentsResult.error || "Erreur lors du chargement des documents")
      }

      if (statsResult.success) {
        setStats(statsResult.data)
      }

      setMissions(missionsData)
      setRubriques(rubriquesData)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateDocument = async (data: {
    nom: string
    type: string
    chemin: string
    categorie: string
    missionId?: number
    rubriqueId?: number
    description?: string
  }) => {
    const result = await createDocument({
      ...data,
      par: "Utilisateur Actuel", // À remplacer par l'utilisateur connecté
    })

    if (result.success) {
      toast.success("Document téléversé avec succès !")
      setIsModalOpen(false)
      fetchData()
    } else {
      toast.error(result.error || "Erreur lors du téléversement")
    }
  }

  const handleStatusChange = async (id: number, statut: string) => {
    const result = await updateDocumentStatus(id, statut)
    if (result.success) {
      toast.success("Statut mis à jour avec succès !")
      fetchData()
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour")
    }
  }

  const handleExportDocuments = () => {
    const csvContent = [
      ["Nom", "Type", "Catégorie", "Statut", "Mission", "Rubrique", "Date de téléversement", "Par", "Description"].join(
        ",",
      ),
      ...documents.map((doc) =>
        [
          `"${doc.nom}"`,
          `"${doc.type}"`,
          `"${doc.categorie}"`,
          `"${doc.statut}"`,
          `"${doc.mission?.nom || "Non assignée"}"`,
          `"${doc.rubrique?.nom || "Non assignée"}"`,
          `"${new Date(doc.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}"`,
          `"${doc.par}"`,
          `"${doc.description || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `documents_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export réalisé avec succès !")
  }

  const handleDownloadCertificate = (doc: Document) => {
    if (doc.statut !== "Validé") {
      toast.error("Seuls les documents validés peuvent générer un certificat")
      return
    }

    const certificateContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificat de Validation - ${doc.nom}</title>
        <style>
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            padding: 40px; 
            background: white;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .logo-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .logo-placeholder {
            width: 80px;
            height: 80px;
            border: 2px solid #666;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #666;
          }
          .title { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1e40af;
            margin: 20px 0;
          }
          .subtitle {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
          }
          .content { 
            margin: 40px 0; 
            font-size: 16px;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          .info-table td {
            padding: 12px;
            border: 1px solid #d1d5db;
          }
          .info-table .label {
            background-color: #f3f4f6;
            font-weight: bold;
            width: 200px;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 80px;
            padding-top: 40px;
          }
          .signature-block {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 10px;
          }
          .date-location {
            text-align: right;
            margin: 30px 0;
            font-style: italic;
          }
          .certificate-number {
            text-align: center;
            font-weight: bold;
            color: #dc2626;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="logo-section">
          <div class="logo-placeholder">LOGO</div>
          <div style="text-align: center; flex: 1;">
            <div style="font-weight: bold; font-size: 16px;">République Islamique de Mauritanie</div>
            <div style="font-size: 14px; margin: 5px 0;">Honneur - Fraternité - Justice</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 15px;">
              Centre de Formation et d'Échange à Distance (CFED)
            </div>
          </div>
          <div class="logo-placeholder">CFED</div>
        </div>

        <div class="header">
          <div class="title">CERTIFICAT DE VALIDATION DE DOCUMENT</div>
          <div class="certificate-number">N° ${String(doc.id).padStart(6, "0")}/2025</div>
        </div>

        <div class="date-location">
          Nouakchott, le ${new Date().toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        <div class="content">
          <p style="font-size: 18px; margin-bottom: 30px;">
            <strong>Le Centre de Formation et d'Échange à Distance certifie par la présente que :</strong>
          </p>

          <table class="info-table">
            <tr>
              <td class="label">Nom du Document</td>
              <td><strong>${doc.nom}</strong></td>
            </tr>
            <tr>
              <td class="label">Type de Document</td>
              <td>${doc.type}</td>
            </tr>
            <tr>
              <td class="label">Catégorie</td>
              <td>${doc.categorie}</td>
            </tr>
            <tr>
              <td class="label">Mission Associée</td>
              <td>${doc.mission?.nom || "Non assignée"}</td>
            </tr>
            <tr>
              <td class="label">Rubrique</td>
              <td>${doc.rubrique?.nom || "Non assignée"}</td>
            </tr>
            <tr>
              <td class="label">Date de Téléversement</td>
              <td>${new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</td>
            </tr>
            <tr>
              <td class="label">Téléversé par</td>
              <td>${doc.par}</td>
            </tr>
            <tr>
              <td class="label">Statut</td>
              <td><strong style="color: #059669;">VALIDÉ</strong></td>
            </tr>
            ${
              doc.description
                ? `
            <tr>
              <td class="label">Description</td>
              <td>${doc.description}</td>
            </tr>
            `
                : ""
            }
          </table>

          <p style="margin: 30px 0; font-size: 16px;">
            Ce document a été examiné, vérifié et validé conformément aux procédures en vigueur 
            au sein du Centre de Formation et d'Échange à Distance.
          </p>

          <p style="margin: 30px 0; font-size: 16px;">
            <strong>Référence de validation :</strong> DOC-${String(doc.id).padStart(6, "0")}-${new Date().getFullYear()}
          </p>
        </div>

        <div class="signatures">
          <div class="signature-block">
            <div><strong>LE RESPONSABLE DOCUMENTS</strong></div>
            <div class="signature-line">Signature et Cachet</div>
          </div>
          <div class="signature-block">
            <div><strong>LE DIRECTEUR</strong></div>
            <div class="signature-line">Signature et Cachet</div>
          </div>
        </div>

        <div style="margin-top: 60px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Ce certificat est généré automatiquement par le système de gestion documentaire du CFED</p>
          <p>Pour toute vérification, contactez le Centre de Formation et d'Échange à Distance</p>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([certificateContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `certificat_validation_${doc.nom.replace(/[^a-zA-Z0-9]/g, "_")}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Certificat de validation téléchargé !")
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.par.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.mission?.nom && doc.mission.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.rubrique?.nom && doc.rubrique.nom.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "Toutes catégories" || doc.categorie === selectedCategory
    const matchesStatus = selectedStatus === "Tous statuts" || doc.statut === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "Validé":
        return <Badge className="bg-green-100 text-green-800">✓ Validé</Badge>
      case "En Attente":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ En attente</Badge>
      case "Rejeté":
        return <Badge className="bg-red-100 text-red-800">✗ Rejeté</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader activeTab="documents" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader activeTab="documents" />

      <div className="px-8 py-8 space-y-6">
        {/* Header avec statistiques */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Validés</p>
                  <p className="text-2xl font-bold">{stats.valides}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold">{stats.enAttente}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Rejetés</p>
                  <p className="text-2xl font-bold">{stats.rejetes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions et filtres */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Téléverser Document
            </Button>
            <Button variant="outline" onClick={handleExportDocuments}>
              <Download className="w-4 h-4 mr-2" />
              Export Liste
            </Button>
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
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  {selectedCategory}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCategory("Toutes catégories")}>
                  Toutes catégories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("Justificatif")}>Justificatif</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("Paiement")}>Paiement</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("Procès-verbal")}>Procès-verbal</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("Rapport")}>Rapport</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedCategory("Autre")}>Autre</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">{selectedStatus}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedStatus("Tous statuts")}>Tous statuts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("Validé")}>Validé</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("En Attente")}>En Attente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("Rejeté")}>Rejeté</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Debug info */}
        <div className="text-sm text-gray-500">
          Documents chargés: {documents.length} | Filtrés: {filteredDocuments.length}
        </div>

        {/* Liste des documents */}
        <div className="grid gap-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(doc.type)}
                    <div>
                      <h3 className="font-semibold text-lg">{doc.nom}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Catégorie:</span> {doc.categorie}
                        </p>
                        <p>
                          <span className="font-medium">Mission:</span> {doc.mission?.nom || "Non assignée"}
                        </p>
                        <p>
                          <span className="font-medium">Rubrique:</span> {doc.rubrique?.nom || "Non assignée"}
                        </p>
                        <p>
                          <span className="font-medium">Téléversé le:</span> {formatDate(doc.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">Par:</span> {doc.par}
                        </p>
                        {doc.description && (
                          <p>
                            <span className="font-medium">Description:</span> {doc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(doc.statut)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </DropdownMenuItem>
                        {doc.statut === "Validé" && (
                          <DropdownMenuItem onClick={() => handleDownloadCertificate(doc)}>
                            <FileText className="w-4 h-4 mr-2" />
                            Certificat de Validation
                          </DropdownMenuItem>
                        )}
                        {doc.statut === "En Attente" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(doc.id, "Validé")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Valider
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(doc.id, "Rejeté")}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Rejeter
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8">
              <div className="text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun document trouvé</p>
                <p className="text-sm">
                  {documents.length === 0
                    ? "Commencez par téléverser votre premier document"
                    : "Aucun document ne correspond aux filtres sélectionnés"}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Modal de téléversement */}
        <DocumentFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateDocument}
          missions={missions}
          rubriques={rubriques}
        />
      </div>
    </div>
  )
}
