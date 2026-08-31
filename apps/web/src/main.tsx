import {
  createRouteMask,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { ErrorComponent } from "./components/errors/error-component"
import { NotFoundComponent } from "./components/errors/not-found"

import {
  getContext,
  Provider,
} from "./integrations/tanstack-query/root-provider.tsx"

import { routeTree } from "./routeTree.gen"

import "./styles.css"

const meterEditMask = createRouteMask({
  from: "/telemetria/$meterId/edit",
  params: true,
  routeTree,
  to: "/telemetria",
})

const meterDeleteMask = createRouteMask({
  from: "/telemetria/$meterId/delete",
  params: true,
  routeTree,
  to: "/telemetria",
})

const router = createRouter({
  context: {
    ...getContext(),
    meters: [],
  },
  defaultErrorComponent: ErrorComponent,
  defaultNotFoundComponent: NotFoundComponent,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  routeMasks: [meterEditMask, meterDeleteMask],
  routeTree,
  scrollRestoration: true,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById("app")
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Provider>
        <RouterProvider router={router} />
      </Provider>
    </StrictMode>
  )
}
