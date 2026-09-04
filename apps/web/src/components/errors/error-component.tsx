import { Link } from "@tanstack/react-router"
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ErrorComponent() {
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/supervisorio"
    }
  }, [])

  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-xl border-destructive/40 border-dashed shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <div className="inline-flex items-center justify-center self-center rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 font-semibold text-destructive text-xs tracking-wide">
            FALHA NO CARREGAMENTO
          </div>
          <CardTitle className="mt-2 text-2xl">Algo Deu Errado</CardTitle>
          <CardDescription className="text-sm">
            A página ou recurso que você tentou acessar resultou em um erro
            inesperado ao processar a requisição ou carregar as informações.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleGoBack} variant="ghost">
              <ArrowLeft className="size-4" />
              <span>Voltar</span>
            </Button>
            <Button asChild variant="default">
              <Link to="/supervisorio">
                <Home className="size-4" />
                <span>Ir para o Início</span>
              </Link>
            </Button>
            <Button onClick={handleReload} variant="outline">
              <RefreshCw className="size-4" />
              <span>Recarregar Página</span>
            </Button>
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t text-muted-foreground text-xs">
          Supervisório LAPES - Anexo C
        </CardFooter>
      </Card>
    </div>
  )
}
