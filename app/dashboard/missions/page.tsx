"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, Filter, Download, Calendar, Users, DollarSign, Bell, User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MissionFormModal } from "@/components/missions/mission-form-modal"
import { MissionDetailsModal } from "@/components/missions/mission-details-modal"
import { MissionDeleteModal } from "@/components/missions/mission-delete-modal"
import { MissionTable } from "@/components/missions/mission-table"
import { getMissions, getMissionStats, createMission, updateMission, deleteMission } from "./actions"
import { getCurrentUser, logoutUser } from "@/app/dashboard/utilisateurs/auth-actions"
import { useToast } from "@/hooks/use-toast"

// Navigation tabs
const navigationTabs = [
  { id: "dashboard", label: "Tableau de Bord", active: false },
  { id: "missions", label: "Gestion des Missions", active: true },
  { id: "budget", label: "Suivi Budgétaire", active: false },
  { id: "documents", label: "Documents", active: false },
]

type Mission = {
  id: number
  date: string
  nomMissionnaire: string
  montantParJour: number
  nombreJours: number
  modePaiement: string
  reference: string
  statut: string
  total: number
  activitesCount: number
  depensesCount: number
  createdAt: string
  updatedAt: string
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [stats, setStats] = useState({
    totalMissions: 0,
    missionsActives: 0,
    missionsTerminees: 0,
    budgetTotal: 0,
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    fetchUser()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [missionsResult, statsResult] = await Promise.all([getMissions(), getMissionStats()])

      if (missionsResult.success && missionsResult.data) {
        setMissions(missionsResult.data)
      } else {
        toast({
          title: "Erreur",
          description: missionsResult.error || "Erreur lors du chargement des missions",
          variant: "destructive",
        })
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
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

  const fetchUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = async () => {
    await logoutUser()
  }

  const getInitials = (nom, prenom) => {
    return `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase()
  }

  const handleTabClick = (tabId: string) => {
    switch (tabId) {
      case "dashboard":
        window.location.href = "/dashboard"
        break
      case "budget":
        window.location.href = "/dashboard/budget"
        break
      case "documents":
        window.location.href = "/dashboard/documents"
        break
      default:
        break
    }
  }

  const handleAddMission = () => {
    setSelectedMission(null)
    setIsFormModalOpen(true)
  }

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission)
    setIsFormModalOpen(true)
  }

  const handleViewDetails = (mission: Mission) => {
    setSelectedMission(mission)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteMission = (mission: Mission) => {
    setSelectedMission(mission)
    setIsDeleteModalOpen(true)
  }

  const handleSubmitForm = async (data: any) => {
    try {
      let result
      if (selectedMission) {
        result = await updateMission(selectedMission.id, data)
      } else {
        result = await createMission(data)
      }

      if (result.success) {
        toast({
          title: "Succès",
          description: selectedMission ? "Mission modifiée avec succès" : "Mission ajoutée avec succès",
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
    if (selectedMission) {
      try {
        const result = await deleteMission(selectedMission.id)
        if (result.success) {
          toast({
            title: "Succès",
            description: "Mission supprimée avec succès",
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
        console.error("Error deleting mission:", error)
        toast({
          title: "Erreur",
          description: "Une erreur inattendue s'est produite",
          variant: "destructive",
        })
      }
    }
  }

  const filteredMissions = missions.filter((mission) => {
    const matchesSearch =
      mission.nomMissionnaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || mission.statut.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (statut: string) => {
    switch (statut.toLowerCase()) {
      case "terminé":
        return <Badge className="bg-green-100 text-green-800">✓ Terminé</Badge>
      case "en cours":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ En cours</Badge>
      case "en attente":
        return <Badge className="bg-blue-100 text-blue-800">📅 En Attente</Badge>
      case "annulé":
        return <Badge className="bg-red-100 text-red-800">✗ Annulé</Badge>
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const formatMRU = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " MRU"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des missions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Single Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Plateforme Formation Continue - Enseignants</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Projet Stratégique 2024</div>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
              </div>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={user ? `${user.prenom} ${user.nom}` : "Utilisateur"} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user ? getInitials(user.nom, user.prenom) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.prenom} ${user.nom}` : "Chargement..."}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mt-4">
            <nav className="flex space-x-8">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.active
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Missions</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalMissions}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Missions Actives</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.missionsActives}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Missions Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{stats.missionsTerminees}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Budget Total</p>
                  <p className="text-2xl font-bold text-purple-600">{formatMRU(stats.budgetTotal)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher une mission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  <span>Filtrer par statut</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>Tous les statuts</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("en cours")}>En cours</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("terminé")}>Terminé</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("en attente")}>En Attente</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("annulé")}>Annulé</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </Button>
            <Button onClick={handleAddMission} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouvelle Mission</span>
            </Button>
          </div>
        </div>

        {/* Missions Table */}
        <Card className="bg-white shadow-sm">
          <CardContent className="p-0">
            <MissionTable
              missions={filteredMissions}
              onEdit={handleEditMission}
              onView={handleViewDetails}
              onDelete={handleDeleteMission}
              getStatusBadge={getStatusBadge}
              formatMRU={formatMRU}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {isFormModalOpen && (
        <MissionFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          mission={selectedMission}
          onSubmit={handleSubmitForm}
        />
      )}

      {isDetailsModalOpen && selectedMission && (
        <MissionDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          mission={selectedMission}
          getStatusBadge={getStatusBadge}
          formatMRU={formatMRU}
        />
      )}

      {isDeleteModalOpen && selectedMission && (
        <MissionDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          mission={selectedMission}
        />
      )}
    </div>
  )
}
