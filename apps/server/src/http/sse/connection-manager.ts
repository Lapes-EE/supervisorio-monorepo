import type { FastifyReply } from "fastify"

export class SSEConnectionManager {
  private readonly clients = new Set<FastifyReply>()
  readonly MAX_CONNECTIONS = 100

  add(reply: FastifyReply): boolean {
    if (this.clients.size >= this.MAX_CONNECTIONS) {
      return false
    }
    this.clients.add(reply)
    return true
  }

  remove(reply: FastifyReply): void {
    this.clients.delete(reply)
  }

  clear(): void {
    this.clients.clear()
  }

  async broadcast(event: string, data: unknown): Promise<void> {
    const deadClients: FastifyReply[] = []
    const promises = Array.from(this.clients).map(async (reply) => {
      try {
        if (reply.sse && typeof reply.sse.send === "function") {
          await reply.sse.send({
            data,
            event,
            id: Date.now().toString(),
          })
        } else {
          deadClients.push(reply)
        }
      } catch {
        deadClients.push(reply)
      }
    })

    await Promise.all(promises)

    for (const dead of deadClients) {
      this.remove(dead)
    }
  }

  get size(): number {
    return this.clients.size
  }
}

export const sseConnectionManager = new SSEConnectionManager()
