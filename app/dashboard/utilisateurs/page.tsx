"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, Search, Filter, UserCheck, Shield } from "lucide-react"
import { UtilisateurTable } from "@/components/utilisateurs/utilisateur-table"
import { UtilisateurFormModal } from "@/components/utilisateurs/utilisateur-form-modal"
import { getUtilisateurs } from "./actions"

interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  roles: Array<{
    id: number
    nom: string
    description: string
  }>
  _count: {
    rapports: number
    journal: number
  }
}

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([])
  const [filteredUtilisateurs, setFilteredUtilisateurs] = useState<Utilisateur[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("Tous")
  const [isLoading, setIsLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)

  useEffect(() => {
    loadUtilisateurs()
  }, [])

  useEffect(() => {
    filterUtilisateurs()
  }, [utilisateurs, searchTerm, selectedRole])

  const loadUtilisateurs = async () => {
    try {
      const data = await getUtilisateurs()
      setUtilisateurs(data)
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUtilisateurs = () => {
    const filtered = utilisateurs.filter((user) => {
      const matchesSearch =
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = selectedRole === "Tous" || user.roles.some((role) => role.nom === selectedRole)
      return matchesSearch && matchesRole
    })
    setFilteredUtilisateurs(filtered)
  }

  const handleCloseModal = () => {
    setIsFormModalOpen(false)
    // Recharger les utilisateurs après fermeture du modal
    loadUtilisateurs()
  }

  // Calculer les statistiques
  const totalUtilisateurs = utilisateurs.length
  const utilisateursActifs = utilisateurs.filter((u) => u._count.journal > 0).length
  const administrateurs = utilisateurs.filter((u) => u.roles.some((r) => r.nom === "Administrateur")).length
  const connexionsAujourdhui = Math.floor(utilisateursActifs * 0.75) // Simulation

  const roles = ["Tous", "Administrateur", "Comptable", "Assistant"]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 text-lg">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setIsFormModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Utilisateurs</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUtilisateurs}</div>
            <p className="text-xs text-green-600 font-medium">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Utilisateurs Actifs</CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{utilisateursActifs}</div>
            <p className="text-xs text-green-600 font-medium">
              {totalUtilisateurs > 0 ? Math.round((utilisateursActifs / totalUtilisateurs) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Administrateurs</CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{administrateurs}</div>
            <p className="text-xs text-purple-600 font-medium">Accès complet</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Connexions Aujourd'hui</CardTitle>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{connexionsAujourdhui}</div>
            <p className="text-xs text-orange-600 font-medium">
              {utilisateursActifs > 0 ? Math.round((connexionsAujourdhui / utilisateursActifs) * 100) : 0}% des actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des Utilisateurs</CardTitle>
              <CardDescription>Gérez les comptes et permissions utilisateurs</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-gray-300 bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    {selectedRole}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {roles.map((role) => (
                    <DropdownMenuItem key={role} onClick={() => setSelectedRole(role)}>
                      {role === "Tous" ? "Tous les rôles" : role}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UtilisateurTable utilisateurs={filteredUtilisateurs} onRefresh={loadUtilisateurs} />
        </CardContent>
      </Card>

      <UtilisateurFormModal isOpen={isFormModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
