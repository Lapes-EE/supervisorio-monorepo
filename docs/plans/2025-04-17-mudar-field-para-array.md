# Alterar Campo `field` para Array na API de Telemetry

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modificar o schema da API de telemetria para aceitar o campo `fields` como string JSON array (ex: `?fields=["CorrenteA","CorrenteB"]`) ao invés do formato atual de múltiplos parâmetros (ex: `?field=CorrenteA&field=CorrenteB`).

**Architecture:** O schema atual em `telemetry-schema.ts` usa `z.union([z.string(), z.array(...)])` com transform. A mudança é simplificar para aceitar apenas string JSON no formato array.

**Tech Stack:** TypeScript, Zod, Fastify, PostgreSQL (drizzle-orm)

---

### Task 1: Modificar Schema `fields` em telemetry-schema.ts

**Files:**
- Modify: `apps/server/src/http/utils/telemetry-schema.ts:39-46`

**Step 1: Editar o schema**

Substituir o schema atual do campo `fields`:

```typescript
// apps/server/src/http/utils/telemetry-schema.ts - linha 39-46

// ANTES:
fields: z
  .union([z.string(), z.array(z.enum(availableFields))])
  .transform((val) => (typeof val === 'string' ? [val] : val))
  .pipe(z.array(z.enum(availableFields)))
  .optional()
  .describe(
    'Campos específicos para retornar. Se não informado, retorna todos.'
  ),

// DEPOIS (seguindo Zod best practices):
// - schema-string-validations: regex para garantir formato JSON array
// - parse-never-trust-json: o pipe z.array(...) valida o resultado do JSON.parse
// - IMPORTANTE: .optional() precisa estar tb no pipe para aceitar undefined do transform
fields: z
  .string()
  .regex(/^\[.*\]$/, 'Formato inválido. Use array JSON, ex: ["campo1","campo2"]')
  .optional()
  .describe('Campos específicos para retornar (ex: ["correnteA","correnteB"])')
  .transform((val) => {
    if (!val) return undefined
    return JSON.parse(val)
  })
  .pipe(z.array(z.enum(availableFields)).optional())
// O .optional() no pipe permite undefined (quando campo não enviado)
// O pipe valida que o resultado é um array de campos válidos
// Se JSON.parse falhar ou campos forem inválidos, retorna erro 400
```

**Step 2: Verificar se o schema compila**

Run: `cd apps/server && npm run build`
Expected: Build completo sem erros

---

### Task 2: Atualizar Testes Existentes

**Files:**
- Modify: `apps/server/src/http/routes/get-database-telemetry.test.ts:527-529`
- Modify: `apps/server/src/http/routes/get-database-telemetry.test.ts:573-575`

**Step 1: Atualizar teste na linha 527-529**

```typescript
// ANTES:
fields: ['frequencia', 'correnteA'],

// DEPOIS:
fields: JSON.stringify(['frequencia', 'correnteA']),
```

**Step 2: Atualizar teste na linha 573-575**

```typescript
// ANTES:
fields: ['frequencia'],

// DEPOIS:
fields: JSON.stringify(['frequencia']),
```

**Step 3: Rodar os testes**

Run: `cd apps/server && npm run test -- --run get-database-telemetry.test.ts`
Expected: Todos os testes passando

---

### Task 3: Adicionar Novo Teste para Formato Invalid

**Files:**
- Modify: `apps/server/src/http/routes/get-database-telemetry.test.ts` (adicionar novo describe)

**Step 1: Adicionar teste de erro**

Após a linha 378 (fim do describe 'Invalid Query Parameter Tests'), adicionar:

```typescript
describe('Fields Format Tests', () => {
  test('should accept fields as JSON string array', async () => {
    const meter = await makeMeters()
    await makeTelemetry({
      meterId: meter.id,
      frequencia: 60,
      correnteA: 10,
    })

    const response = await request(api.server)
      .get('/telemetry')
      .query({
        meterId: meter.id,
        period: 'last_24_hours',
        aggregation: 'raw',
        fields: JSON.stringify(['frequencia', 'correnteA']),
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    const telemetryData = response.body.data[0]
    expect(telemetryData).toHaveProperty('frequencia', 60)
    expect(telemetryData).toHaveProperty('correnteA', 10)
    expect(telemetryData).not.toHaveProperty('tensaoFaseNeutroA')
  })

  test('should return 400 for invalid fields format', async () => {
    const meter = await makeMeters()

    const response = await request(api.server)
      .get('/telemetry')
      .query({
        meterId: meter.id,
        fields: 'not-a-json-array',
      })

    expect(response.status).toBe(400)
  })
})
```

**Step 2: Rodar os novos testes**

Run: `cd apps/server && npm run test -- --run get-database-telemetry.test.ts`
Expected: Todos os testes passando

---

### Task 4: Verificar Integração Completa

**Step 1: Rodar todos os testes**

Run: `cd apps/server && npm run test -- --run`
Expected: Todos os testes passando

**Step 2: Verificar build**

Run: `cd apps/server && npm run build`
Expected: Build completo sem erros

---

## Resumo das Mudanças

1. **telemetry-schema.ts** - Schema `fields` modificado para aceitar string JSON array
2. **get-database-telemetry.test.ts** - Testes atualizados para usar JSON.stringify e novos testes adicionados