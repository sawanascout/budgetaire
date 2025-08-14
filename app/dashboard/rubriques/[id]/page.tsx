"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Calendar, MapPin, Users, Eye, Edit, Trash2, Monitor, Bell } from "lucide-react"
import { ActiviteFormModal } from "@/components/activites/activite-form-modal"
import { ActiviteDetailsModal } from "@/components/activites/activite-details-modal"
import { ActiviteDeleteModal } from "@/components/activites/activite-delete-modal"
import { getActivitesByRubrique, createActivite, updateActivite, deleteActivite } from "./actions"
import { getRubriques } from "@/app/dashboard/actions"
import { useToast } from "@/hooks/use-toast"

type Activite = {
  id: number
  titre: string
  description: string
  budgetPrevu: number
  statut: string
  dateDebut?: string
  dateFin?: string
  region?: string
  nombreParticipants?: number
  responsable?: string
  technologiesUtilisees?: string
  fonctionnalitesDevelloppees?: string
  objectifs?: string
  resultatsAttendus?: string
  methodologie?: string
  rubriqueId: number
}

export default function RubriqueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const rubriqueId = Number.parseInt(params.id as string)

  const [activites, setActivites] = useState<Activite[]>([])
  const [rubrique, setRubrique] = useState(null)
  const [rubriques, setRubriques] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedActivite, setSelectedActivite] = useState<Activite | null>(null)

  useEffect(() => {
    if (rubriqueId) {
      fetchData()
    }
  }, [rubriqueId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [activitesResult, rubriquesResult] = await Promise.all([getActivitesByRubrique(rubriqueId), getRubriques()])

      if (activitesResult.success && activitesResult.data) {
        setActivites(activitesResult.data)
      }

      if (rubriquesResult.success && rubriquesResult.data) {
        setRubriques(rubriquesResult.data)
        const currentRubrique = rubriquesResult.data.find((r) => r.id === rubriqueId)
        setRubrique(currentRubrique)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const totalDepense = activites.reduce((sum, activite) => sum + (activite.budgetPrevu || 0), 0)
    const budgetTotal = rubrique?.budget || 0
    const reste = budgetTotal - totalDepense
    const nombreActivites = activites.length

    return { totalDepense, budgetTotal, reste, nombreActivites }
  }

  const { totalDepense, budgetTotal, reste, nombreActivites } = calculateTotals()

  const formatMRU = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " MRU"
  }

  const getStatusBadge = (statut: string) => {
  switch (statut?.toLowerCase()) {
      case "terminée":
        return <Badge className="bg-green-100 text-green-800">✓ terminée</Badge>
      case "en cours":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ en cours</Badge>
      case "planifiée":
        return <Badge className="bg-blue-100 text-blue-800">📅 planifiée</Badge>
      case "suspendue":
        return <Badge className="bg-red-100 text-red-800">✗ suspendue</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const handleAddActivite = () => {
    setSelectedActivite(null)
    setIsFormModalOpen(true)
  }

  const handleEditActivite = (activite: Activite) => {
    setSelectedActivite(activite)
    setIsFormModalOpen(true)
  }

  const handleViewDetails = (activite: Activite) => {
    setSelectedActivite(activite)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteActivite = (activite: Activite) => {
    setSelectedActivite(activite)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitForm = async (data: any) => {
    try {
      let result
      if (selectedActivite) {
        result = await updateActivite(selectedActivite.id, { ...data, rubriqueId })
      } else {
        result = await createActivite({ ...data, rubriqueId })
      }

      if (result.success) {
        toast({
          title: "Succès",
          description: selectedActivite ? "Activité modifiée avec succès" : "Activité ajoutée avec succès",
        })
        setIsFormModalOpen(false)
        await fetchData()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur s'est produite",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      })
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedActivite) {
      try {
        const result = await deleteActivite(selectedActivite.id)
        if (result.success) {
          toast({
            title: "Succès",
            description: "Activité supprimée avec succès",
          })
          setIsDeleteModalOpen(false)
          await fetchData()
        } else {
          toast({
            title: "Erreur",
            description: result.error || "Erreur lors de la suppression",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting activity:", error)
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des activités...</p>
        </div>
      </div>
    )
  }

  if (!rubrique) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Rubrique non trouvée</h1>
          <Button onClick={() => router.push("/dashboard")}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header unique */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PF</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Plateforme Formation Continue - Enseignants</h1>
                  <p className="text-sm text-gray-600">{rubrique.nom}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Projet Stratégique 2024</div>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>
              <Button onClick={handleAddActivite} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nouvelle Activité</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Metrics Cards - 4 cards avec Activités */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Budget Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {budgetTotal > 0 ? formatMRU(budgetTotal) : "À définir"}
                  </p>
                </div>
                <div className="text-blue-600">$</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dépensé</p>
                  <p className="text-2xl font-bold text-green-600">{formatMRU(totalDepense)}</p>
                </div>
                <div className="text-green-600">$</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reste</p>
                  <p className="text-2xl font-bold text-orange-600">{formatMRU(reste)}</p>
                </div>
                <div className="text-orange-600">$</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Activités</p>
                  <p className="text-2xl font-bold text-purple-600">{nombreActivites}</p>
                </div>
                <div className="text-purple-600">👥</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activities Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activités de la Rubrique</h3>

          {activites.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Monitor className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité</h3>
                <p className="text-gray-600 mb-4">Commencez par ajouter une nouvelle activité à cette rubrique.</p>
                <Button onClick={handleAddActivite}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une activité
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activites.map((activite) => {
                const budgetPrevu = activite.budgetPrevu || 0
                const percentage = budgetTotal > 0 ? (budgetPrevu / budgetTotal) * 100 : 0

                return (
                  <Card key={activite.id} className="bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{activite.titre}</h4>
                            {getStatusBadge(activite.statut)}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{activite.description}</p>

                          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                            {activite.dateDebut && activite.dateFin && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(activite.dateDebut).toLocaleDateString()} -{" "}
                                  {new Date(activite.dateFin).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {activite.region && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{activite.region}</span>
                              </div>
                            )}
                            {activite.nombreParticipants && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{activite.nombreParticipants} participants</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Budget: {formatMRU(budgetPrevu)}</span>
                            </div>
                            <Progress value={Math.min(percentage, 100)} className="h-2 [&>div]:bg-blue-500" />
                          </div>

                          {activite.responsable && (
                            <p className="text-sm text-gray-600 mt-3">
                              <strong>Responsable:</strong> {activite.responsable}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(activite)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditActivite(activite)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivite(activite)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isFormModalOpen && (
        <ActiviteFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          activite={selectedActivite}
          rubriques={rubriques}
          onSuccess={handleSubmitForm}
        />
      )}

      {isDetailsModalOpen && selectedActivite && (
        <ActiviteDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          activite={selectedActivite}
        />
      )}

      {isDeleteModalOpen && selectedActivite && (
        <ActiviteDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          activite={selectedActivite}
        />
      )}
    </div>
  )
}
