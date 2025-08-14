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

  const downloadPaymentOrder = async (mission: Mission) => {
    const doc = new jsPDF()
    const currentDate = new Date(mission.date)
      .toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-")

    // Create header image with Canvas
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = 600
    canvas.height = 200

    if (ctx) {
      // White background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw logos (placeholder circles)
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(50, 50, 30, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fillStyle = "#000000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText("LOGO", 50, 55)

      ctx.beginPath()
      ctx.arc(550, 50, 30, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.fillText("CFED", 550, 55)

      // Header text
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("الجمهورية الإسلامية الموريتانية", 300, 30)
      ctx.font = "14px Arial"
      ctx.fillText("République Islamique de Mauritanie", 300, 50)
      ctx.font = "12px Arial"
      ctx.fillText("شرف - أخاء - عدل", 300, 70)
      ctx.fillText("Honneur - Fraternité - Justice", 300, 90)

      ctx.font = "bold 14px Arial"
      ctx.fillText("مركز التكوين والتبادل عن بعد", 300, 120)
      ctx.font = "12px Arial"
      ctx.fillText("Centre de Formation et d'Échange à Distance (CFED)", 300, 140)

      // Add border
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, canvas.width, canvas.height)
    }

    // Convert canvas to image and add to PDF
    const headerImage = canvas.toDataURL("image/png")
    doc.addImage(headerImage, "PNG", 10, 10, 190, 63)

    // Title
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`ORDRE DE PAIEMENT ${mission.reference}/2025`, 105, 85, { align: "center" })

    // Date and location
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Nouakchott, le ${currentDate}`, 170, 95)

    // Beneficiary
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Bénéficiaire", 20, 110)
    doc.setFont("helvetica", "normal")
    doc.rect(20, 115, 170, 10)
    doc.text(mission.nomMissionnaire, 25, 122)

    // Budget table
    autoTable(doc, {
      startY: 135,
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

    // Amount table
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

    // Payment reason
    const yPos = doc.lastAutoTable.finalY + 15
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Motif de règlement", 20, yPos)
    doc.setFont("helvetica", "normal")
    const month = new Date(mission.date).toLocaleDateString("fr-FR", { month: "long" }).toUpperCase()
    const year = new Date(mission.date).getFullYear()
    doc.text(`RÈGLEMENT HONORAIRE AIDE COMPTABLE CFED MOIS DE ${month} ${year}`, 20, yPos + 7, { maxWidth: 170 })

    // Payment method
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("MODE DE PAIEMENT", 20, yPos + 25)

    doc.setFont("helvetica", "normal")
    doc.rect(20, yPos + 30, 170, 10)
    doc.text(mission.modePaiement, 25, yPos + 37)

    if (mission.modePaiement === "Chèque") {
      doc.text(`Chèque N° ${mission.reference}`, 25, yPos + 47)
    }

    // Amount in words table
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

    // Save PDF
    const fileName = `CFED_Ordre_Paiement_${mission.reference}_${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

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
