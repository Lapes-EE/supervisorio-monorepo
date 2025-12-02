import {
  createRouteMask,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import {
  getContext,
  Provider,
} from './integrations/tanstack-query/root-provider.tsx'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './styles.css'

const meterEditMask = createRouteMask({
  routeTree,
  from: '/telemetria/$meterId/edit',
  to: '/telemetria',
  params: true,
})

const meterDeleteMask = createRouteMask({
  routeTree,
  from: '/telemetria/$meterId/delete',
  to: '/telemetria',
  params: true,
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    ...getContext(),
    meters: [],
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  routeMasks: [meterEditMask, meterDeleteMask],
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('app')
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
