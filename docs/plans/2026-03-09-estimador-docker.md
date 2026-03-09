# Estimador de Estados - Implementação via Microsserviço Docker com `uv`

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar um microsserviço Python (FastAPI) em Docker utilizando `uv` para gerenciamento de dependências, que executa o estimador de estados (via WLS) e integrá-lo à API Node.js existente via HTTP.

**Architecture:** O estimador será um container Docker isolado, acessível apenas internamente pela API Node.js através de uma rede Docker compartilhada. O estimador é stateless e será chamado via REST.

**Tech Stack:** 
- `uv` (Gerenciador de pacotes e ambientes Python)
- FastAPI (Python)
- Docker + Docker Compose
- Node.js/Fastify (API existente)
- Fetch API (chamada HTTP)

---

## Task 1: Criar estrutura base do estimator com `uv`

**Files:**
- Create: `apps/estimator/pyproject.toml`
- Create: `apps/estimator/.python-version`
- Create: `apps/estimator/Dockerfile`

**Step 1: Criar pasta e inicializar com uv**

```bash
mkdir -p apps/estimator
cd apps/estimator
uv init --app
```

Isso criará `pyproject.toml`, `.python-version` e `hello.py`.

**Step 2: Renomear hello.py para main.py**

```bash
mv hello.py main.py
```

**Step 3: Adicionar dependências com uv**

```bash
uv add fastapi uvicorn numpy scipy pydantic pandas
```

**Step 4: Criar Dockerfile otimizado para uv**

Criar arquivo `apps/estimator/Dockerfile`:

```dockerfile
FROM python:3.11-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-install-project --no-dev

COPY . .

RUN uv sync --frozen --no-dev

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 5: Commit**

```bash
git add apps/estimator/
git commit -m "✨ feat(estimator): estrutura base com uv"
```

**Files:**
- Modify: `apps/estimator/main.py`

**Step 1: Substituir código do main.py**

Atualizar `apps/estimator/main.py` com os schemas corretos:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Estimador de Estados WLS")

class Medicao(BaseModel):
    tipo: str  # 'P', 'Q' ou 'V'
    barra_k: int
    barra_m: Optional[int] = None
    valor: float
    peso: float  # Inverso da variância do erro

class ParametrosRede(BaseModel):
    linhas: List[dict]
    barras: int

class EstimativaInput(BaseModel):
    medicoes: List[Medicao]
    rede: ParametrosRede

class EstadoBarra(BaseModel):
    barra: int
    tensao_modulo: float  # |V| (pu)
    tensao_angulo: float  # theta (graus ou rad)

class EstimativaOutput(BaseModel):
    estados: List[EstadoBarra]
    convergencia_alcancada: bool
    iteracoes: int
    residuos: List[float]  # Erro das medições após convergência

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "estimator"}

@app.post("/estimar", response_model=EstimativaOutput)
def estimar_estados(input_data: EstimativaInput):
    # TODO: Implementar lógica WLS do TCC (Apêndice A)
    # 1. Montar Matrizes G e B a partir de input_data.rede
    # 2. Montar vetor z e matriz de pesos W a partir de input_data.medicoes
    # 3. Executar loop de Newton-Raphson

    return EstimativaOutput(
        estados=[EstadoBarra(barra=1, tensao_modulo=1.0, tensao_angulo=0.0)],
        convergencia_alcancada=True,
        iteracoes=3,
        residuos=[0.001, -0.002]
    )
```

**Step 2: Commit**

```bash
git add apps/estimator/main.py
git commit -m "✨ feat(estimator): implementar schemas Pydantic"
```

---

## Task 3: Atualizar docker-compose com serviço estimator

**Files:**
- Create: `docker-compose.yml`

**Step 1: Criar docker-compose.yml completo**

Criar arquivo `docker-compose.yml`:

```yaml
services:
  hyper:
    image: timescale/timescaledb:latest-pg17
    container_name: supervisorio
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  estimator:
    build:
      context: ./apps/estimator
      dockerfile: Dockerfile
    container_name: estimador
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

**Step 2: Commit**

```bash
git add docker-compose.yml
git commit -m "⚙️ chore(docker): adicionar serviço estimator ao compose"
```

---

## Task 4: Adicionar cliente HTTP na API TypeScript

**Files:**
- Create: `apps/server/src/lib/estimator-client.ts`

**Step 1: Criar cliente do estimator**

Criar arquivo `apps/server/src/lib/estimator-client.ts`:

```typescript
const ESTIMATOR_URL = process.env.ESTIMATOR_URL || 'http://estimator:8000';

export interface Medicao {
  tipo: 'P' | 'Q' | 'V';
  barra_k: number;
  barra_m?: number;
  valor: number;
  peso: number;
}

export interface ParametrosRede {
  linhas: Array<{de: number; para: number; r: number; x: number; b?: number}>;
  barras: number;
}

export interface EstimativaInput {
  medicoes: Medicao[];
  rede: ParametrosRede;
}

export interface EstadoBarra {
  barra: number;
  tensao_modulo: number;
  tensao_angulo: number;
}

export interface EstimativaOutput {
  estados: EstadoBarra[];
  convergencia_alcancada: boolean;
  iteracoes: number;
  residuos: number[];
}

export async function rodarEstimador(input: EstimativaInput): Promise<EstimativaOutput> {
  const response = await fetch(`${ESTIMATOR_URL}/estimar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Erro no Estimador: ${response.statusText}`);
  }

  return response.json() as Promise<EstimativaOutput>;
}
```

**Step 2: Commit**

```bash
git add apps/server/src/lib/estimator-client.ts
git commit -m "🔗 feat(server): adicionar cliente HTTP para estimator"
```

---

## Task 5: Testar integração localmente

**Step 1: Subir containers**

```bash
docker-compose up --build -d
```

**Step 2: Verificar logs do estimator**

```bash
docker logs estimador
```

**Step 3: Testar health de dentro da network**

```bash
docker exec -it <container_server> curl http://estimator:8000/health
```

**Step 4: Testar endpoint /estimar**

```bash
curl -X POST http://localhost:8000/estimar \
  -H "Content-Type: application/json" \
  -d '{
    "medicoes": [{"tipo": "V", "barra_k": 1, "valor": 1.0, "peso": 1.0}],
    "rede": {"barras": 1, "linhas": []}
  }'
```

**Step 5: Commit**

```bash
git add .
git commit -m "🧪 test(estimator): adicionar testes de integração"
```

---

## Task 6: Deploy na VPS

**Step 1: Pull e rebuild**

```bash
git pull origin master
docker-compose up -d --build
```

**Step 2: Verificar serviços**

```bash
docker ps
docker logs estimador
```

**Step 3: Tag**

```bash
git tag v1.0.0-estimator
```

---

## Notas

- **Rede interna**: estimator não expõe porta (mais seguro)
- **uv**: dependências instaladas ~10x mais rápido que pip
- **Próximo passo**: implementar lógica WLS real no `main.py`
