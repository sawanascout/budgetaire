"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Plus, Search, Users, Key, Settings } from "lucide-react"
import { RoleTable } from "@/components/roles/role-table"
import { RoleFormModal } from "@/components/roles/role-form-modal"
import { getRoles } from "./actions"

interface Role {
  id: number
  nom: string
  description: string
  utilisateurs: any[]
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRoles()
  }, [])

  useEffect(() => {
    const filtered = roles.filter(
      (role) =>
        role.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRoles(filtered)
  }, [roles, searchTerm])

  const loadRoles = async () => {
    try {
      const data = await getRoles()
      setRoles(data)
      setFilteredRoles(data)
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const totalUsers = roles.reduce((sum, role) => sum + role.utilisateurs.length, 0)
  const mostUsedRole = roles.reduce(
    (prev, current) => (prev.utilisateurs.length > current.utilisateurs.length ? prev : current),
    roles[0] || { nom: "Aucun", utilisateurs: [] },
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Rôles & Permissions</h1>
            <p className="text-gray-600 text-lg">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Rôles</h1>
          <p className="text-gray-600 text-lg">Gérez les rôles utilisateurs du système</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rôle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Rôles</CardTitle>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
            <p className="text-xs text-blue-600 font-medium">Rôles définis</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Utilisateurs Assignés</CardTitle>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
            <p className="text-xs text-purple-600 font-medium">Total assignations</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Rôle le Plus Utilisé</CardTitle>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mostUsedRole.nom}</div>
            <p className="text-xs text-orange-600 font-medium">{mostUsedRole.utilisateurs.length} utilisateurs</p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Moyenne par Rôle</CardTitle>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {roles.length > 0 ? Math.round(totalUsers / roles.length) : 0}
            </div>
            <p className="text-xs text-green-600 font-medium">Utilisateurs/rôle</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Rechercher un rôle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Rôles</CardTitle>
          <CardDescription>{filteredRoles.length} rôle(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <RoleTable roles={filteredRoles} />
        </CardContent>
      </Card>

      {/* Create Modal */}
      <RoleFormModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          loadRoles() // Recharger les données après création
        }}
      />
    </div>
  )
}
