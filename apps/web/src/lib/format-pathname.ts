export function formatPathname(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments.at(-1) ?? 'Dashboard'

  // Capitaliza a primeira letra
  return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
}
