import { Link, type ToOptions, useMatchRoute } from '@tanstack/react-router'
import {
  ChartArea,
  ClipboardList,
  Home,
  type LucideIcon,
  Settings,
} from 'lucide-react'
import { ModeToggle } from './mode-toggle'

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
    title: 'Gráficos',
    url: { to: '/gráficos' },
    icon: ChartArea,
  },
  {
    title: 'Configurações',
    url: { to: '/settings' },
    icon: Settings,
  },
]

export function NewAppSidebar() {
  const matchRoute = useMatchRoute()
  return (
    <div className="my-2 flex flex-row">
      <div className="flex flex-row gap-4">
        {items.map((item, index) => {
          const isActive =
            typeof item.url.to === 'string' &&
            !!matchRoute({ to: item.url.to, fuzzy: false })

          const middleIndex = Math.floor(items.length / 2)

          return (
            <>
              {index === middleIndex && (
                <h1
                  className="scroll-m-20 whitespace-nowrap text-center font-extrabold text-4xl tracking-tight"
                  key="divider"
                >
                  SUPERVISÓRIO LAPES - ANEXO C
                </h1>
              )}
              <Link
                className="flex w-full flex-row items-center gap-2 rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:whitespace-nowrap [&>svg]:size-4 [&>svg]:shrink-0"
                data-active={isActive}
                to={item.url.to}
              >
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </>
          )
        })}
      </div>
      <div className="absolute top-2 right-2">
        <ModeToggle />
      </div>
    </div>
  )
}
