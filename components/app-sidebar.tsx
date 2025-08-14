"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Home,
  MapPin,
  FileText,
  PieChart,
  Users,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Briefcase,
  Receipt,
  Archive,
  TrendingUp,
  Shield,
  Clock,
  Layers,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Vue d'ensemble",
    items: [
      {
        title: "Tableau de bord",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Indicateurs",
        url: "/dashboard/indicators",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Gestion",
    items: [
      {
        title: "Rubriques",
        url: "/dashboard/rubriques",
        icon: Layers,
      },
      {
        title: "Missions",
        url: "/dashboard/missions",
        icon: MapPin,
      },
      {
        title: "Dépenses",
        url: "/dashboard/depenses",
        icon: Receipt,
      },
      {
        title: "Activités",
        url: "/dashboard/activites",
        icon: Briefcase,
      },
    ],
  },
  {
    title: "Documents",
    items: [
      {
        title: "Bibliothèque",
        url: "/dashboard/documents",
        icon: FileText,
      },
     
    ],
  },
  {
    title: "Rapports & Analytics",
    items: [
      {
        title: "Rapports",
        url: "/dashboard/rapports",
        icon: PieChart,
      },
      {
        title: "Journal d'actions",
        url: "/dashboard/journal",
        icon: Clock,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Utilisateurs",
        url: "/dashboard/utilisateurs",
        icon: Users,
      },
      {
        title: "Rôles & Permissions",
        url: "/dashboard/roles",
        icon: Shield,
      },
      
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-0">
      <SidebarHeader className="border-0 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative overflow-hidden">
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BudgetPro</h1>
            <p className="text-xs text-blue-100">Gestion Budgétaire</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 space-y-6">
        {menuItems.map((group, index) => (
          <SidebarGroup key={index} className="space-y-3">
            <SidebarGroupLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-3" />
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className="group relative overflow-hidden"
                    >
                      <Link href={item.url} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 group-data-[active=true]:bg-blue-200 transition-all duration-200">
                          <item.icon className="w-4 h-4 group-hover:text-blue-600 group-data-[active=true]:text-blue-700 transition-all duration-200" />
                        </div>
                        <span className="font-medium">{item.title}</span>
                        {/* Indicateur actif animé */}
                        {pathname === item.url && (
                          <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {index < menuItems.length - 1 && (
              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>

    </Sidebar>
  )
}
