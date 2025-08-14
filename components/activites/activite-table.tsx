"use client"

import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Activite = {
  id: number
  titre: string
  description: string
  budgetPrevu: string
  budgetConsomme: string
  statut: string
  missionId: number
  rubriqueId: number
  mission: {
    id: number
    nom: string
  }
  rubrique: {
    id: number
    nom: string
  }
}

type ActiviteTableProps = {
  activites: Activite[]
  onEdit: (activite: Activite) => void
  onView: (activite: Activite) => void
  onDelete: (activite: Activite) => void
}

export function ActiviteTable({ activites, onEdit, onView, onDelete }: ActiviteTableProps) {
  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case "En cours":
        return "default"
      case "Terminé":
        return "secondary"
      case "Planifié":
        return "outline"
      case "Suspendu":
        return "destructive"
      default:
        return "default"
    }
  }

  if (activites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Aucune activité trouvée.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Budget Prévu</TableHead>
            <TableHead>Budget Consommé</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Mission</TableHead>
            <TableHead>Rubrique</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activites.map((activite) => (
            <TableRow key={activite.id}>
              <TableCell className="font-medium">{activite.titre}</TableCell>
              <TableCell className="max-w-xs truncate">{activite.description}</TableCell>
              <TableCell>{activite.budgetPrevu}</TableCell>
              <TableCell>{activite.budgetConsomme}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(activite.statut)}>{activite.statut}</Badge>
              </TableCell>
              <TableCell>{activite.mission.nom}</TableCell>
              <TableCell>{activite.rubrique.nom}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(activite)} className="h-8 w-8 p-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(activite)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(activite)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
