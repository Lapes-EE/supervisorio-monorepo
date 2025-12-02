import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboard)/settings/$meterId')({
  component: RouteComponent,
  loader: ({ context, location }) => {
    const meters = context.meters
    const meterId = Number(location.pathname.split('/').at(-1))

    return meters.find((meter) => meter.id === meterId)
  },
})

function RouteComponent() {
  const meter = Route.useLoaderData()

  if (!meter) {
    return <div>Nenhum medidor encontrado</div>
  }

  return (
    <div>
      <h1>Configurações do medidor {meter.name}</h1>
      <ul>
        {Object.entries(meter).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{' '}
            {value && typeof value === 'object' ? (
              <pre style={{ display: 'inline', margin: 0 }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              String(value)
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
