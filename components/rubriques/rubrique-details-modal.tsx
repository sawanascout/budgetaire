"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { FileText, Layers } from "lucide-react"
import type { Rubrique } from "../../app/dashboard/rubriques/actions"

interface RubriqueDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rubrique: Rubrique | null
}

export function RubriqueDetailsModal({ open, onOpenChange, rubrique }: RubriqueDetailsModalProps) {
  if (!rubrique) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Détails de la rubrique
          </DialogTitle>
          <DialogDescription>Informations détaillées sur la rubrique {rubrique.nom}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Nom</h4>
                <p className="font-medium">{rubrique.nom}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{rubrique.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Documents</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {rubrique._count?.documents || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents associés */}
          {rubrique.documents && rubrique.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents associés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rubrique.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{document.nom}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {document.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
