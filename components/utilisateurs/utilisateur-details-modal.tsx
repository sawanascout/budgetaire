"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, User, Mail, Shield, FileText, Activity, Calendar } from "lucide-react"
import { getUtilisateurById } from "@/app/dashboard/utilisateurs/actions"

interface Role {
  id: number
  nom: string
  description: string
}

interface Rapport {
  id: number
  titre: string
  dateCreation: Date
}

interface JournalAction {
  id: number
  action: string
  dateAction: Date
  details?: string
}

interface UtilisateurDetails {
  id: number
  nom: string
  prenom: string
  email: string
  roles: Role[]
  rapports: Rapport[]
  journal: JournalAction[]
}

interface UtilisateurDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  utilisateur: { id: number } | null
}

export function UtilisateurDetailsModal({ isOpen, onClose, utilisateur }: UtilisateurDetailsModalProps) {
  const [utilisateurDetails, setUtilisateurDetails] = useState<UtilisateurDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && utilisateur) {
      loadUtilisateurDetails()
    }
  }, [isOpen, utilisateur])

  const loadUtilisateurDetails = async () => {
    if (!utilisateur) return

    setIsLoading(true)
    try {
      const details = await getUtilisateurById(utilisateur.id)
      setUtilisateurDetails(details)
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Détails de l'utilisateur</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : utilisateurDetails ? (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {utilisateurDetails.prenom[0]}
                      {utilisateurDetails.nom[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {utilisateurDetails.prenom} {utilisateurDetails.nom}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {utilisateurDetails.email}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Rôles assignés
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {utilisateurDetails.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant={role.nom === "Administrateur" ? "default" : "secondary"}
                          className={
                            role.nom === "Administrateur"
                              ? "bg-purple-100 text-purple-800"
                              : role.nom === "Comptable"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                          }
                        >
                          {role.nom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Rapports créés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold">{utilisateurDetails.rapports.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Actions effectuées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold">{utilisateurDetails.journal.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Rôles assignés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold">{utilisateurDetails.roles.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rapports récents */}
              {utilisateurDetails.rapports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Rapports récents
                    </CardTitle>
                    <CardDescription>Les derniers rapports créés par cet utilisateur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {utilisateurDetails.rapports.slice(0, 5).map((rapport) => (
                        <div key={rapport.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{rapport.titre}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(rapport.dateCreation)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activité récente */}
              {utilisateurDetails.journal.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activité récente
                    </CardTitle>
                    <CardDescription>Les dernières actions effectuées par cet utilisateur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {utilisateurDetails.journal.slice(0, 10).map((action) => (
                        <div key={action.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="font-medium">{action.action}</p>
                            {action.details && <p className="text-sm text-gray-600 mt-1">{action.details}</p>}
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(action.dateAction)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Impossible de charger les détails de l'utilisateur</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
