import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { NewAppSidebar } from '@/components/app-sidebar-new.tsx'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
        <div className="flex w-full items-center justify-center">
          <NewAppSidebar />
        </div>
        <Outlet />
      </ThemeProvider>
      <TanStackRouterDevtools />

      <TanStackQueryLayout />
    </>
  ),
})
