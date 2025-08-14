"use client"

import type React from "react"
import jsPDF from "jspdf"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react"

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: {
      finalY: number
    }
  }
}

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

  const downloadPaymentOrder = (mission: Mission) => {
    const doc = new jsPDF()
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Add header with logos
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")

    // Left logo placeholder
    doc.circle(30, 30, 15)
    doc.setFontSize(8)
    doc.text("LOGO", 25, 32)

    // Right logo placeholder
    doc.circle(180, 30, 15)
    doc.text("CFED", 175, 32)

    // Center header
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("جمهورية الإسلامية الموريتانية", 105, 20, { align: "center" })
    doc.text("République Islamique de Mauritanie", 105, 28, { align: "center" })
    doc.setFontSize(8)
    doc.text("شرف - أخاء - عدل", 105, 35, { align: "center" })
    doc.text("Honneur - Fraternité - Justice", 105, 42, { align: "center" })

    // Organization name
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Centre de Formation et d'Échange à Distance (CFED)", 105, 55, { align: "center" })
    doc.setFontSize(8)
    doc.text("مركز التكوين والتبادل عن بعد", 105, 62, { align: "center" })

    // Title
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(`ORDRE DE PAIEMENT ${mission.reference}/2025`, 105, 80, { align: "center" })

    // Date and location
    doc.setFontSize(10)
    doc.setFont("helvetica", "italic")
    doc.text(`Nouakchott, le ${currentDate}`, 170, 95)

    // Beneficiary section
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bénéficiaire", 20, 115)
    doc.setFont("helvetica", "normal")
    doc.rect(20, 120, 170, 15)
    doc.text(mission.nomMissionnaire, 25, 130)

    // Budget table
    const budgetData = [
      ["Budget", "Exercice", "Compte Principal", "Sous Compte"],
      ["CFED", "2025", "65", "65010"],
    ]
    doc.autoTable({
      startY: 145,
      head: [budgetData[0]],
      body: [budgetData[1]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0] },
    })

    // Amount section
    const amountData = [
      ["Montant", "Précompte", "Montant Net à Payer"],
      [formatMRU(mission.total), "0.00", formatMRU(mission.total)],
    ]
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [amountData[0]],
      body: [amountData[1]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0] },
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { fontStyle: "bold", textColor: [214, 51, 132] },
      },
    })

    // Payment reason
    const yPos = doc.lastAutoTable.finalY + 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Motif de règlement:", 20, yPos)
    doc.setFont("helvetica", "normal")
    const motif = `RÈGLEMENT HONORAIRE AIDE COMPTABLE CFED MOIS DE ${new Date(mission.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }).toUpperCase()}`
    doc.text(motif, 20, yPos + 8, { maxWidth: 170 })

    // Payment mode
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.rect(20, yPos + 25, 170, 20)
    doc.text("MODE DE PAIEMENT", 105, yPos + 32, { align: "center" })
    doc.text(mission.modePaiement, 105, yPos + 40, { align: "center" })

    if (mission.modePaiement === "Chèque") {
      doc.text(`Chèque N° ${mission.reference}`, 105, yPos + 48, { align: "center" })
    }

    // Amount in words
    const amountWordsData = [
      ["Arrêté le présent Ordre de Paiement à la somme de", "(en Ouguiya)"],
      ["Douze-mille", formatMRU(mission.total)],
    ]
    doc.autoTable({
      startY: yPos + 60,
      head: [amountWordsData[0]],
      body: [amountWordsData[1]],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [248, 249, 250], textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "center", fontStyle: "bold" },
      },
    })

    // Signatures
    const sigY = doc.lastAutoTable.finalY + 30
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    // Three signature blocks
    doc.text("POUR ACQUIT", 35, sigY, { align: "center" })
    doc.text("LE COMPTABLE", 105, sigY, { align: "center" })
    doc.text("LE DIRECTEUR", 175, sigY, { align: "center" })

    // Signature lines
    doc.line(20, sigY + 25, 50, sigY + 25)
    doc.line(90, sigY + 25, 120, sigY + 25)
    doc.line(160, sigY + 25, 190, sigY + 25)

    // Save the PDF
    const fileName = `CFED_Ordre_Paiement_${mission.reference}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
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
                      <DropdownMenuItem onClick={() => downloadPaymentOrder(mission)}>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger Ordre de Paiement
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
