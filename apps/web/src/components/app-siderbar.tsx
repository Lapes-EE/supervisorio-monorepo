import { Link, type ToOptions, useMatchRoute } from '@tanstack/react-router'
import {
  ClipboardList,
  Home,
  Inbox,
  type LucideIcon,
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
    url: { to: '/supervisorio' },
    icon: Home,
  },
  {
    title: 'Telemetria',
    url: { to: '/telemetria' },
    icon: ClipboardList,
  },
  {
    title: 'Placeholder',
    url: { to: '/' },
    icon: Inbox,
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
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
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
