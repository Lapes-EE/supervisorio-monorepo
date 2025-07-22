import { Link, type ToOptions, useMatchRoute } from '@tanstack/react-router'
import {
  Calendar,
  ClipboardList,
  Home,
  Inbox,
  type LucideIcon,
  Search,
  Settings,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type SidebarItem = {
  title: string
  url: ToOptions
  icon: LucideIcon
}

// Menu items.
const items: SidebarItem[] = [
  {
    title: 'Supervisório',
    url: { to: '/' },
    icon: Home,
  },
  {
    title: 'Telemetria',
    url: { to: '/telemetria' },
    icon: ClipboardList,
  },
  {
    title: 'Placeholder',
    url: { to: '/demo/tanstack-query' },
    icon: Inbox,
  },
  {
    title: 'Placeholder',
    url: '#',
    icon: Calendar,
  },
  {
    title: 'Placeholder',
    url: '#',
    icon: Search,
  },
  {
    title: 'Configurações',
    url: { to: '/settings' },
    icon: Settings,
  },
]

export function AppSidebar() {
  const matchRoute = useMatchRoute()
  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  typeof item.url.to === 'string' &&
                  !!matchRoute({ to: item.url.to, fuzzy: false })

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url.to}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
