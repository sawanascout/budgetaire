import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Archive } from "lucide-react"

export default function ArchivesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Archives</h1>
          <p className="text-gray-600 text-lg">Accédez aux documents et données archivés.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenu des Archives</CardTitle>
          <CardDescription>Cette page affichera les documents et données archivés.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg text-gray-500">
            <Archive className="w-12 h-12 mr-4" />
            <p className="text-xl">Contenu des archives à venir...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
