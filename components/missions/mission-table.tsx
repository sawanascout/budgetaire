"use client"

import type React from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react"

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
}

interface MissionTableProps {
  missions: Mission[]
  onEdit: (mission: Mission) => void
  onView: (mission: Mission) => void
  onDelete: (mission: Mission) => void
  getStatusBadge: (statut: string) => React.ReactNode
  formatMRU: (amount: number) => string
}

export function MissionTable({ missions, onEdit, onView, onDelete, getStatusBadge, formatMRU }: MissionTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  const downloadMissionOrder = (mission: Mission) => {
    // Generate PDF content
    const pdfContent = generateMissionOrderPDF(mission)

    // Create blob and download
    const blob = new Blob([pdfContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ordre-de-mission-${mission.reference}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateMissionOrderPDF = (mission: Mission) => {
    const currentDate = new Date().toLocaleDateString("fr-FR")

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordre de Mission ${mission.reference}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .document {
            background: white;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: #ddd;
            border-radius: 50%;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
        .subtitle {
            font-size: 18px;
            color: #666;
            margin-bottom: 10px;
        }
        .date-location {
            text-align: right;
            margin: 20px 0;
            font-size: 14px;
        }
        .content-section {
            margin: 30px 0;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .info-table td {
            padding: 10px;
            border: 1px solid #ddd;
            vertical-align: top;
        }
        .info-table .label {
            background-color: #f8f9fa;
            font-weight: bold;
            width: 30%;
        }
        .amount-section {
            background-color: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #ddd;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding-top: 40px;
        }
        .signature-block {
            text-align: center;
            width: 30%;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 60px;
            padding-top: 10px;
        }
        @media print {
            body { background: white; }
            .document { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="document">
        <div class="header">
            <div class="logo-section">
                <div class="logo"></div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 16px; font-weight: bold;">جمهورية الإسلامية الموريتانية</div>
                    <div style="font-size: 14px;">République Islamique de Mauritanie</div>
                    <div style="font-size: 12px;">شرف - أخاء - عدل</div>
                    <div style="font-size: 12px;">Honneur - Fraternité - Justice</div>
                </div>
                <div class="logo"></div>
            </div>
            <div style="font-size: 18px; font-weight: bold; margin: 20px 0;">
                Centre de Formation et d'Échange à Distance (CFED)
            </div>
            <div style="font-size: 16px; color: #666;">
                مركز التكوين والتبادل عن بعد
            </div>
        </div>

        <div class="title">ORDRE DE MISSION ${mission.reference}</div>
        
        <div class="date-location">
            Nouakchott, le ${currentDate}
        </div>

        <div class="content-section">
            <table class="info-table">
                <tr>
                    <td class="label">Bénéficiaire</td>
                    <td>${mission.nomMissionnaire}</td>
                </tr>
            </table>

            <table class="info-table">
                <tr>
                    <td class="label">Budget</td>
                    <td class="label">Exercice</td>
                    <td class="label">Compte Principal</td>
                    <td class="label">Sous Compte</td>
                </tr>
                <tr>
                    <td>CFED</td>
                    <td>2025</td>
                    <td>65</td>
                    <td>65010</td>
                </tr>
            </table>

            <div class="amount-section">
                <table class="info-table">
                    <tr>
                        <td class="label">Montant</td>
                        <td class="label">Précompte</td>
                        <td class="label">Montant Net à Payer</td>
                    </tr>
                    <tr>
                        <td>${formatMRU(mission.total)}</td>
                        <td>0.00</td>
                        <td style="font-weight: bold;">${formatMRU(mission.total)}</td>
                    </tr>
                </table>

                <div style="margin: 20px 0;">
                    <strong>Motif de règlement:</strong><br>
                    RÈGLEMENT HONORAIRE MISSION FORMATION CFED - ${formatDate(mission.date)}
                </div>

                <div style="text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0;">
                    MODE DE PAIEMENT
                </div>

                <div style="margin: 20px 0;">
                    <strong>${mission.modePaiement}</strong>
                    ${mission.modePaiement === "Chèque" ? `Chèque N° ${mission.reference}` : ""}
                </div>

                <table class="info-table">
                    <tr>
                        <td>Arrêté le présent Ordre de Mission à la somme de</td>
                        <td>(en Ouguiya)</td>
                    </tr>
                    <tr>
                        <td><strong>Douze-mille</strong></td>
                        <td style="font-weight: bold;">${formatMRU(mission.total)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="signatures">
            <div class="signature-block">
                <div><strong>POUR ACQUIT</strong></div>
                <div class="signature-line"></div>
            </div>
            <div class="signature-block">
                <div><strong>LE COMPTABLE</strong></div>
                <div class="signature-line"></div>
            </div>
            <div class="signature-block">
                <div><strong>LE DIRECTEUR</strong></div>
                <div class="signature-line"></div>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  if (missions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Aucune mission trouvée.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Tableau Détaillé des Missions</h3>
        <p className="text-sm text-gray-600">Gérez et suivez toutes les missions</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Missionnaire</TableHead>
            <TableHead>Montant/Jour</TableHead>
            <TableHead>Jours</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Mode Paiement</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission.id}>
              <TableCell>{formatDate(mission.date)}</TableCell>
              <TableCell className="font-medium">{mission.nomMissionnaire}</TableCell>
              <TableCell>{formatMRU(mission.montantParJour)}</TableCell>
              <TableCell>{mission.nombreJours}</TableCell>
              <TableCell className="font-semibold">{formatMRU(mission.total)}</TableCell>
              <TableCell>{mission.modePaiement}</TableCell>
              <TableCell>{mission.reference}</TableCell>
              <TableCell>{getStatusBadge(mission.statut)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(mission)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(mission)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    {mission.statut.toLowerCase() === "terminé" && (
                      <DropdownMenuItem onClick={() => downloadMissionOrder(mission)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger Ordre de Mission
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDelete(mission)} className="text-red-600">
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
  )
}
