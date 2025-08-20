"use client"

import type React from "react"
import { useState } from "react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  CreditCard,
  FileText,
  TrendingUp,
  Clock
} from "lucide-react"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  const getPaymentModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'chèque':
        return <FileText className="h-4 w-4" />
      case 'virement':
        return <CreditCard className="h-4 w-4" />
      case 'espèces':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusColor = (statut: string) => {
    switch (statut.toLowerCase()) {
      case 'terminé':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'en cours':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'en attente':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'annulé':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const downloadPaymentOrder = (mission: Mission) => {
    const pdfContent = generatePaymentOrderPDF(mission)
    const blob = new Blob([pdfContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ordre-de-paiement-${mission.reference}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePaymentOrderPDF = (mission: Mission) => {
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ordre de Paiement ${mission.reference}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            line-height: 1.6;
        }
        .document {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .logo-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
        }
        .logo-placeholder {
            width: 90px;
            height: 90px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            color: rgba(255,255,255,0.9);
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
        }
        .title {
            font-size: 32px;
            font-weight: 700;
            margin: 20px 0;
            text-align: center;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 18px;
            opacity: 0.9;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px;
        }
        .date-location {
            text-align: right;
            margin: 30px 0;
            font-style: italic;
            color: #64748b;
            font-size: 16px;
        }
        .beneficiary-section {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 15px;
            border-left: 5px solid #3b82f6;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .info-table td {
            padding: 16px;
            border: 1px solid #e2e8f0;
            vertical-align: top;
            transition: background-color 0.2s ease;
        }
        .info-table .label {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            font-weight: 600;
            width: 25%;
        }
        .info-table tr:hover td:not(.label) {
            background-color: #f1f5f9;
        }
        .amount-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            padding: 30px;
            margin: 30px 0;
            border-radius: 15px;
            border: 2px solid #f59e0b;
            position: relative;
            overflow: hidden;
        }
        .amount-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.8; }
        }
        .payment-mode {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            border-radius: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 80px;
            padding-top: 40px;
            border-top: 2px solid #e2e8f0;
        }
        .signature-block {
            text-align: center;
            width: 30%;
        }
        .signature-line {
            border-top: 2px solid #1f2937;
            margin-top: 60px;
            padding-top: 10px;
            font-weight: bold;
            color: #1f2937;
        }
        .amount-words {
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 10px;
            border-left: 4px solid #0ea5e9;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(0,0,0,0.03);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
        }
        @media print {
            body { background: white; }
            .document { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="watermark">CFED</div>
    <div class="document">
        <div class="header">
            <div class="logo-section">
                <div class="logo-placeholder">LOGO</div>
                <div style="text-align: center; flex: 1;">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">جمهورية الإسلامية الموريتانية</div>
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">République Islamique de Mauritanie</div>
                    <div style="font-size: 14px; margin: 5px 0; opacity: 0.9;">شرف - أخاء - عدل</div>
                    <div style="font-size: 14px; opacity: 0.9;">Honneur - Fraternité - Justice</div>
                </div>
                <div class="logo-placeholder">CFED</div>
            </div>
            
            <div style="text-align: center; margin-bottom: 20px; position: relative; z-index: 1;">
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Centre de Formation et d'Échange à Distance (CFED)</div>
                <div style="font-size: 16px; opacity: 0.9;">مركز التكوين والتبادل عن بعد</div>
            </div>

            <div class="title">ORDRE DE PAIEMENT ${mission.reference}/2025</div>
        </div>
        
        <div class="content">
            <div class="date-location">
                📍 Nouakchott, le ${currentDate}
            </div>

            <div class="beneficiary-section">
                <table class="info-table">
                    <tr>
                        <td class="label">👤 Bénéficiaire</td>
                        <td colspan="3"><strong style="font-size: 18px; color: #1e293b;">${mission.nomMissionnaire}</strong></td>
                    </tr>
                </table>
            </div>

            <table class="info-table">
                <tr>
                    <td class="label">💼 Budget</td>
                    <td class="label">📅 Exercice</td>
                    <td class="label">🏦 Compte Principal</td>
                    <td class="label">📊 Sous Compte</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">CFED</td>
                    <td style="font-weight: 600;">2025</td>
                    <td style="font-weight: 600;">65</td>
                    <td style="font-weight: 600;">65010</td>
                </tr>
            </table>

            <div class="amount-section">
                <table class="info-table">
                    <tr>
                        <td class="label">💰 Montant</td>
                        <td class="label">📉 Précompte</td>
                        <td class="label">✅ Montant Net à Payer</td>
                    </tr>
                    <tr>
                        <td style="font-size: 18px; font-weight: bold; color: #059669;">${formatMRU(mission.total)}</td>
                        <td style="font-size: 16px;">0.00</td>
                        <td style="font-size: 20px; font-weight: bold; color: #dc2626;">${formatMRU(mission.total)}</td>
                    </tr>
                </table>

                <div style="margin: 25px 0; padding: 20px; background: rgba(255,255,255,0.8); border-radius: 10px; position: relative; z-index: 1;">
                    <strong style="color: #1e293b; font-size: 16px;">📝 Motif de règlement:</strong><br>
                    <span style="color: #374151; font-size: 15px; line-height: 1.6;">
                        RÈGLEMENT HONORAIRE AIDE COMPTABLE CFED MOIS DE ${new Date(mission.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase()}
                    </span>
                </div>
            </div>

            <div class="payment-mode">
                💳 MODE DE PAIEMENT
            </div>

            <div style="margin: 20px 0; text-align: center; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <strong style="font-size: 20px; color: #1e293b;">${mission.modePaiement}</strong>
                ${mission.modePaiement === "Chèque" ? `<br><span style="color: #64748b; font-size: 16px;">Chèque N° ${mission.reference}</span>` : ""}
            </div>

            <div class="amount-words">
                <table class="info-table">
                    <tr>
                        <td style="width: 70%; font-weight: 600; color: #1e293b;">Arrêté le présent Ordre de Paiement à la somme de</td>
                        <td style="text-align: center; font-weight: bold; color: #0ea5e9;">(en Ouguiya)</td>
                    </tr>
                    <tr>
                        <td><strong style="font-size: 18px; color: #059669;">Douze-mille</strong></td>
                        <td style="text-align: center; font-size: 20px; font-weight: bold; color: #dc2626;">${formatMRU(mission.total)}</td>
                    </tr>
                </table>
            </div>

            <div class="signatures">
                <div class="signature-block">
                    <div><strong>✍️ POUR ACQUIT</strong></div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-block">
                    <div><strong>🧮 LE COMPTABLE</strong></div>
                    <div class="signature-line"></div>
                </div>
                <div class="signature-block">
                    <div><strong>👨‍💼 LE DIRECTEUR</strong></div>
                    <div class="signature-line"></div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  const filteredMissions = missions.filter(mission =>
    mission.nomMissionnaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.statut.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMissions = filteredMissions.length
  const totalAmount = filteredMissions.reduce((sum, mission) => sum + mission.total, 0)
  const completedMissions = filteredMissions.filter(m => m.statut.toLowerCase() === 'terminé').length

  if (missions.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune mission trouvée</h3>
          <p className="text-gray-600">Commencez par créer votre première mission</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Missions</p>
                <p className="text-2xl font-bold text-blue-900">{totalMissions}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Terminées</p>
                <p className="text-2xl font-bold text-emerald-900">{completedMissions}</p>
              </div>
              <Clock className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Montant Total</p>
                <p className="text-2xl font-bold text-amber-900">{formatMRU(totalAmount)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Taux Réussite</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau principal */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                Gestion des Missions
              </CardTitle>
              <CardDescription className="text-slate-600 mt-1">
                Suivez et gérez toutes vos missions en temps réel
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher une mission..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50 hover:from-slate-100 hover:to-blue-100 transition-all duration-200">
                  <TableHead className="font-semibold text-slate-700 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Missionnaire
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Montant/Jour</TableHead>
                  <TableHead className="font-semibold text-slate-700">Jours</TableHead>
                  <TableHead className="font-semibold text-slate-700">Total</TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Mode Paiement
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Référence</TableHead>
                  <TableHead className="font-semibold text-slate-700">Statut</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMissions.map((mission, index) => (
                  <TableRow 
                    key={mission.id}
                    className={`
                      transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                      ${hoveredRow === mission.id ? 'shadow-lg scale-[1.01] z-10' : ''}
                    `}
                    onMouseEnter={() => setHoveredRow(mission.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium text-slate-700">{formatDate(mission.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {mission.nomMissionnaire.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{mission.nomMissionnaire}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {formatMRU(mission.montantParJour)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {mission.nombreJours} jour{mission.nombreJours > 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-lg text-emerald-600">
                        {formatMRU(mission.total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentModeIcon(mission.modePaiement)}
                        <span className="text-slate-700">{mission.modePaiement}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">
                        {mission.reference}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(mission.statut)} font-medium`}>
                        {mission.statut}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                          <DropdownMenuItem 
                            onClick={() => onView(mission)}
                            className="hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onEdit(mission)}
                            className="hover:bg-amber-50 hover:text-amber-700 transition-colors duration-200"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          {mission.statut.toLowerCase() === "terminé" && (
                            <DropdownMenuItem 
                              onClick={() => downloadPaymentOrder(mission)}
                              className="hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Télécharger Ordre
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => onDelete(mission)} 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                          >
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
        </CardContent>
      </Card>
    </div>
  )
}