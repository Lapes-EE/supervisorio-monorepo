import { Link } from "@tanstack/react-router"
import { ArrowLeft, FileQuestion, Home } from "lucide-react"
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

export function NotFoundComponent() {
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/supervisorio"
    }
  }, [])

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <Card className="w-full max-w-xl border-dashed shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground ring-8 ring-muted/30">
            <FileQuestion className="size-8 text-primary" />
          </div>
          <div className="inline-flex items-center justify-center self-center rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 font-semibold text-muted-foreground text-xs tracking-wide">
            ERRO 404
          </div>
          <CardTitle className="mt-2 text-2xl">Página Não Encontrada</CardTitle>
          <CardDescription className="text-sm">
            A página ou recurso que você está procurando não existe, foi movido
            ou está temporariamente indisponível.
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
          </div>
        </CardContent>

        <CardFooter className="justify-center border-t text-muted-foreground text-xs">
          Supervisório LAPES - Anexo C
        </CardFooter>
      </Card>
    </div>
  )
}
