import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { NewAppSidebar } from '@/components/app-sidebar-new.tsx'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { Toaster } from '@/components/ui/sonner'
import { getMeters } from '@/http/gen/endpoints/lapes-api.gen'
import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

interface MyRouterContext {
  queryClient: QueryClient
  meters: GetMeters200Item[]
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const meters = await getMeters()

    return {
      meters: meters.data,
    }
  },
  component: () => (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex h-full w-full items-center justify-center">
          <NewAppSidebar />
        </div>
        <div className="mt-16 mb-2 flex-1">
          <Outlet />
        </div>
      </ThemeProvider>
      <Toaster />
      <TanStackDevtools
        config={{
          position: 'bottom-left',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
