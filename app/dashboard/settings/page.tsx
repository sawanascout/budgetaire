import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600 text-lg">Configurez les paramètres généraux de l'application.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres du Système</CardTitle>
          <CardDescription>Cette page permettra de configurer divers aspects de l'application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg text-gray-500">
            <Settings className="w-12 h-12 mr-4" />
            <p className="text-xl">Contenu des paramètres à venir...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
