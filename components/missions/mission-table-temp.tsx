"use client"

import type React from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
    const currentDate = new Date(mission.date)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")

    // Header avec texte arabe
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")

    // Titre en arabe (الجمهورية الإسلامية الموريتانية)
    doc.text("الجمهورية الإسلامية الموريتانية", 105, 15, { align: "center", lang: "ar" })
    // Titre en français
    doc.text("République Islamique de Mauritanie", 105, 22, { align: "center" })

    // Devise en arabe (شرف - أخاء - عدل)
    doc.setFontSize(10)
    doc.text("شرف - أخاء - عدل", 105, 29, { align: "center", lang: "ar" })
    // Devise en français
    doc.text("Honneur - Fraternité - Justice", 105, 36, { align: "center" })

    // Nom de l'organisation en arabe (مركز التكوين والتبادل عن بعد)
    doc.text("مركز التكوين والتبادل عن بعد", 105, 50, { align: "center", lang: "ar" })
    // Nom de l'organisation en français
    doc.text("Centre de Formation et d'Échange à Distance", 105, 57, { align: "center" })

    // Titre du document
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`ORDRE DE PAIEMENT ${mission.reference}/2025`, 105, 70, { align: "center" })

    // Date et lieu
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Nouakchott, le ${currentDate}`, 170, 80)

    // Bénéficiaire
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Bénéficiaire", 20, 95)
    doc.setFont("helvetica", "normal")
    doc.rect(20, 100, 170, 10)
    doc.text(mission.nomMissionnaire, 25, 107)

    // Tableau Budget
    autoTable(doc, {
      startY: 120,
      head: [["Budget", "Exercice", "Compte Principal", "Sous Compte"]],
      body: [["CFED", "2025", "65", "65010"]],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        cellWidth: "wrap",
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      margin: { left: 20 },
    })

    // Tableau Montant
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Montant", "Précompte", "Montant Net à Payer"]],
      body: [[formatMRU(mission.total), "0,00", formatMRU(mission.total)]],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { fontStyle: "bold" },
        2: { fontStyle: "bold" },
      },
      margin: { left: 20 },
    })

    // Motif de règlement
    const yPos = doc.lastAutoTable.finalY + 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Motif de règlement", 20, yPos)
    doc.setFont("helvetica", "normal")
    const month = new Date(mission.date).toLocaleDateString("fr-FR", { month: "long" }).toUpperCase()
    const year = new Date(mission.date).getFullYear()
    doc.text(`RÈGLEMENT HONORAIRE AIDE COMPTABLE CFED MOIS DE ${month} ${year}`, 20, yPos + 7, { maxWidth: 170 })

    // Mode de paiement
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("MODE DE PAIEMENT", 20, yPos + 25)

    doc.setFont("helvetica", "normal")
    doc.rect(20, yPos + 30, 170, 10)
    doc.text(mission.modePaiement, 25, yPos + 37)

    if (mission.modePaiement === "Chèque") {
      doc.text(`Chèque N° ${mission.reference}`, 25, yPos + 47)
    }

    // Montant en lettres
    autoTable(doc, {
      startY: yPos + 60,
      head: [["Arrêté le présent Ordre de Paiement à la somme de", "(en Ouguiya)"]],
      body: [[`${convertNumberToWords(mission.total)}`, formatMRU(mission.total)]],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: "center" },
      },
      margin: { left: 20 },
    })

    // Signatures
    const sigY = doc.lastAutoTable.finalY + 20
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")

    doc.text("POUR ACQUIT", 35, sigY, { align: "center" })
    doc.text("LE COMPTABLE", 105, sigY, { align: "center" })
    doc.text("LE DIRECTEUR", 175, sigY, { align: "center" })

    doc.line(20, sigY + 10, 50, sigY + 10)
    doc.line(90, sigY + 10, 120, sigY + 10)
    doc.line(160, sigY + 10, 190, sigY + 10)

    // Enregistrer le PDF
    const fileName = `Ordre_Paiement_${mission.reference}.pdf`
    doc.save(fileName)
  }

  // Helper function to convert number to words in French
  function convertNumberToWords(num: number): string {
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"]
    const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
    const tens = [
      "",
      "dix",
      "vingt",
      "trente",
      "quarante",
      "cinquante",
      "soixante",
      "soixante-dix",
      "quatre-vingt",
      "quatre-vingt-dix",
    ]

    if (num === 0) return "zéro"

    let result = ""
    const thousands = Math.floor(num / 1000)
    const remainder = num % 1000

    if (thousands > 0) {
      result += units[thousands] + "-mille"
      if (remainder > 0) result += "-"
    }

    if (remainder > 0) {
      const hundreds = Math.floor(remainder / 100)
      const tensAndUnits = remainder % 100

      if (hundreds > 0) {
        result += hundreds === 1 ? "cent" : units[hundreds] + "-cent"
        if (tensAndUnits > 0) result += "-"
      }

      if (tensAndUnits > 0) {
        if (tensAndUnits < 10) {
          result += units[tensAndUnits]
        } else if (tensAndUnits < 20) {
          result += teens[tensAndUnits - 10]
        } else {
          const ten = Math.floor(tensAndUnits / 10)
          const unit = tensAndUnits % 10
          result += tens[ten]
          if (unit > 0) {
            result += ten === 7 || ten === 9 ? "-" + teens[unit] : "-" + units[unit]
          }
        }
      }
    }

    return result + (num > 1 ? "" : "")
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
