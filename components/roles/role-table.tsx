"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Users } from "lucide-react"
import { RoleFormModal } from "./role-form-modal"
import { RoleDetailsModal } from "./role-details-modal"
import { RoleDeleteModal } from "./role-delete-modal"

interface Role {
  id: number
  nom: string
  description: string
  utilisateurs: any[]
}

interface RoleTableProps {
  roles: Role[]
}

export function RoleTable({ roles }: RoleTableProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsEditModalOpen(true)
  }

  const handleDetails = (role: Role) => {
    setSelectedRole(role)
    setIsDetailsModalOpen(true)
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setIsDeleteModalOpen(true)
  }

  const getRoleColor = (nom: string) => {
    switch (nom.toLowerCase()) {
      case "administrateur":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "comptable":
        return "bg-green-100 text-green-800 border-green-200"
      case "gestionnaire de mission":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "assistant":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Utilisateurs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(role.nom)}>{role.nom}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate">{role.description}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                    <Users className="w-3 h-3 mr-1" />
                    {role.utilisateurs.length}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDetails(role)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(role)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(role)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <RoleFormModal
        role={selectedRole}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedRole(null)
        }}
      />

      <RoleDetailsModal
        role={selectedRole}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedRole(null)
        }}
      />

      <RoleDeleteModal
        role={selectedRole}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedRole(null)
        }}
      />
    </>
  )
}
