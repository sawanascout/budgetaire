"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Shield, Mail } from "lucide-react"
import { UtilisateurFormModal } from "./utilisateur-form-modal"
import { UtilisateurDetailsModal } from "./utilisateur-details-modal"
import { UtilisateurDeleteModal } from "./utilisateur-delete-modal"

interface Role {
  id: number
  nom: string
  description: string
}

interface Utilisateur {
  id: number
  nom: string
  prenom: string
  email: string
  roles: Role[]
  _count: {
    rapports: number
    journal: number
  }
}

interface UtilisateurTableProps {
  utilisateurs: Utilisateur[]
  onRefresh: () => void
}

export function UtilisateurTable({ utilisateurs, onRefresh }: UtilisateurTableProps) {
  const [selectedUtilisateur, setSelectedUtilisateur] = useState<Utilisateur | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleEdit = (utilisateur: Utilisateur) => {
    setSelectedUtilisateur(utilisateur)
    setIsFormModalOpen(true)
  }

  const handleView = (utilisateur: Utilisateur) => {
    setSelectedUtilisateur(utilisateur)
    setIsDetailsModalOpen(true)
  }

  const handleDelete = (utilisateur: Utilisateur) => {
    setSelectedUtilisateur(utilisateur)
    setIsDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setSelectedUtilisateur(null)
    setIsFormModalOpen(false)
    setIsDetailsModalOpen(false)
    setIsDeleteModalOpen(false)
    onRefresh()
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Utilisateur</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Email</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Rôles</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Activité</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.prenom[0]}
                      {user.nom[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-sm text-gray-500">ID: {user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role, index) => (
                      <Badge
                        key={index}
                        variant={role.nom === "Administrateur" ? "default" : "secondary"}
                        className={
                          role.nom === "Administrateur"
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                            : role.nom === "Comptable"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }
                      >
                        {role.nom}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    <p>{user._count.rapports} rapport(s)</p>
                    <p>{user._count.journal} action(s)</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => handleView(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleEdit(user)}
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
                        <DropdownMenuItem className="text-blue-600" onClick={() => handleView(user)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir le profil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-green-600" onClick={() => handleEdit(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-orange-600">
                          <Shield className="w-4 h-4 mr-2" />
                          Gérer les rôles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user)}>
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

      <UtilisateurFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        utilisateur={selectedUtilisateur}
        isEditing={!!selectedUtilisateur}
      />

      <UtilisateurDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModals}
        utilisateur={selectedUtilisateur}
      />

      <UtilisateurDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        utilisateur={selectedUtilisateur}
      />
    </>
  )
}
