# Orval v8 Migration: Fix Consuming Code

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all TypeScript errors caused by the orval v7→v8 migration in the web app consuming code.

**Architecture:** The orval v8 upgrade changed how generated API types and hooks work. The `customInstance` mutator already unwraps Axios `.data`, so query functions now return typed data directly (not wrapped in `{ data: T }`). Mutations no longer accept `axios` config in options. Error types changed from `AxiosError` to plain type objects.

**Tech Stack:** React, TanStack Query, TanStack Router, TypeScript, orval v8.9.0

---

## Error Categories

### Category A: `Property 'data' does not exist` (4 files)
The `customInstance` already unwraps Axios `.data`, so `getMeters()` returns `GetMeters200Item[]` directly, not `{ data: GetMeters200Item[] }`. Same for `getTelemetryIp`, `getTelemetry`, `postSessionsPassword`.

### Category B: `Object literal may only specify known properties, 'axios'` (3 files)
Orval v8 removed the `axios` option from mutation hook configs. Auth headers must be passed through `customInstance` interceptors instead.

### Category C: `Property 'response' does not exist on type` (3 files)
Error types are now plain objects (e.g. `PostMeters401 = { error: string }`), not `AxiosError`. No `.response.data.error` — just `.error`.

### Category D: `GetTelemetryPeriod` missing `last_measurement` (1 file)
New enum value `last_measurement` was added to the API but `periodLabels` map doesn't include it.

### Category E: `Property 'message' does not exist on type 'string'` (1 file)
The `usePostSessionsPassword` mutation error type is `string`, not `Error`. Error handling needs adjustment.

### Category F: Implicit `any` types (3 files)
Type narrowing issues in `.map()` and `.find()` callbacks — separate from v8 migration.

---

### Task 1: Add `last_measurement` to period-selector

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/gráficos/-components/period-selector.tsx`

**Step 1: Add the missing enum value to periodLabels**

```typescript
// Add this entry to the periodLabels object:
last_measurement: 'Última medição',
```

The full object becomes:
```typescript
const periodLabels: Record<GetTelemetryPeriod, string> = {
  last_measurement: 'Última medição',
  last_5_minutes: 'Últimos 5 minutos',
  last_30_minutes: 'Últimos 30 minutos',
  last_hour: 'Última hora',
  last_6_hours: 'Últimas 6 horas',
  last_12_hours: 'Últimas 12 horas',
  last_24_hours: 'Últimas 24 horas',
  last_7_days: 'Últimos 7 dias',
  this_month: 'Este mês',
  last_30_days: 'Últimos 30 dias',
  this_year: 'Este ano',
  today: 'Hoje',
}
```

**Step 2: Verify no TS2741 error**

Run: `npx tsc --noEmit 2>&1 | grep period-selector`
Expected: No errors

---

### Task 2: Fix `__root.tsx` — remove `.data` accessor

**Files:**
- Modify: `apps/web/src/routes/__root.tsx`

**Step 1: Change `meters: response.data` to `meters: response`**

The `getMeters()` function returns `GetMeters200Item[]` directly (customInstance unwraps axios `.data`).

```typescript
// Before (v7):
//   meters: response.data,

// After (v8):
return {
  meters: response,
}
```

**Step 2: Verify no TS2339 error**

Run: `npx tsc --noEmit 2>&1 | grep __root`
Expected: No errors for `__root.tsx`

---

### Task 3: Fix `login/index.tsx` — remove `.data` on response and fix error type

**Files:**
- Modify: `apps/web/src/routes/login/index.tsx`

**Step 1: Fix `response.data.token` → `response.token`**

The `postSessionsPassword()` returns `PostSessionsPassword201` directly, which is `{ token: string }`.

```typescript
// Before:
//   const token = response.data.token

// After:
onSuccess: (response) => {
  const token = response.token
  localStorage.setItem('token', token)
  toast('Login bem-sucedido!')
  navigate({ to: '/telemetria' })
},
```

**Step 2: Fix error handling — `error` is `string`, not `Error`**

The mutation error type is `string`, so `error.message` doesn't exist. Use `error` directly or cast.

```typescript
// Before:
//   onError: (error) => {
//     toast('Erro ao fazer login', { description: error.message })

// After:
onError: (error) => {
  toast('Erro ao fazer login', {
    description: typeof error === 'string' ? error : 'Erro desconhecido',
  })
},
```

**Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep login`
Expected: No errors

---

### Task 4: Fix `building-monitor/data.ts` — remove `.data` accessors

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/supervisorio/-components/building-monitor/data.ts`

**Step 1: Fix `getMetersFull` — line 41**

```typescript
// Before:
//   const response = await getMeters()
//   const data = response.data

// After:
const response = await getMeters()
const data = response
```

**Step 2: Fix `useSensors` telemetry query — line 237**

The `getTelemetry()` returns `GetTelemetry200` which has `{ data, total, period, nullCount, aggregation }`. The destructuring was wrong before — `response.data` gave the full object. Now it's direct.

```typescript
// Before:
//   queryFn: async (): Promise<GetTelemetry200> => {
//     const response = await getTelemetry(...)
//     return response.data
//   },

// After:
queryFn: async (): Promise<GetTelemetry200> => {
  const response = await getTelemetry({
    period,
    meterId: meter.id,
    aggregation,
  })
  return response
},
```

**Step 3: Fix telemetry data access — line 245**

```typescript
// Before:
//   const telemetryData = telemetryResponse?.data ?? []

// After:
const telemetryData = telemetryResponse?.data ?? []
```

This stays the same because `telemetryResponse` is now `GetTelemetry200` directly, and `.data` accesses the `data` property of that object (which is `GetTelemetry200DataItem[]`).

**Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep data.ts`
Expected: No errors

---

### Task 5: Fix `$telemetryIp.tsx` — remove `.data` accessor

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/telemetria/$telemetryIp.tsx`

**Step 1: Fix loader — line 36-38**

```typescript
// Before:
//   loader: async ({ params }) => {
//     const result = await getTelemetryIp(params.telemetryIp)
//     return result.data
//   },

// After:
loader: async ({ params }) => {
  const result = await getTelemetryIp(params.telemetryIp)
  return result
},
```

**Step 2: Fix queryFn — line 51-53**

```typescript
// Before:
//   queryFn: async () => {
//     const result = await getTelemetryIp(telemetryIp)
//     return result.data
//   },

// After:
queryFn: async () => {
  const result = await getTelemetryIp(telemetryIp)
  return result
},
```

**Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 grep telemetryIp`
Expected: No errors

---

### Task 6: Fix mutation hooks — remove `axios` options and fix error access

The orval v8 mutation hooks no longer accept `{ axios: { headers: { Authorization: ... } } }`. Auth headers must be set via Axios interceptors on `AXIOS_INSTANCE`.

**Files:**
- Modify: `apps/web/src/http/custom-instance.ts` (add auth interceptor)
- Modify: `apps/web/src/routes/(dashboard)/telemetria/$meterId.delete.tsx`
- Modify: `apps/web/src/routes/(dashboard)/telemetria/-components/telemetrys-form.tsx`
- Modify: `apps/web/src/routes/(dashboard)/telemetria/-components/telemetrys-edit-form.tsx`

**Step 1: Add auth interceptor to `custom-instance.ts`**

```typescript
import Axios, { type AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const customInstance = async <T>(
  config: AxiosRequestConfig,
): Promise<T> => {
  const { data } = await AXIOS_INSTANCE(config);
  return data;
};

export default customInstance;
```

**Step 2: Remove `axios` options from mutation hooks**

In `$meterId.delete.tsx`:
```typescript
// Before:
// const mutation = useDeleteMetersId({
//   axios: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// })

// After:
const mutation = useDeleteMetersId()
```

In `telemetrys-form.tsx`:
```typescript
// Before:
// const mutation = usePostMeters({
//   axios: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// })

// After:
const mutation = usePostMeters()
```

In `telemetrys-edit-form.tsx`:
```typescript
// Before:
// const mutation = usePutMetersId({
//   axios: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
// })

// After:
const mutation = usePutMetersId()
```

**Step 3: Fix error access patterns**

In `$meterId.delete.tsx`:
```typescript
// Before:
//   onError(error) {
//     description: `${error.response?.data.error}, é necessário estar logado`

// After:
onError(error) {
  toast('Erro ao deletar', {
    description: `${(error as DeleteMetersId401)?.error ?? 'Erro desconhecido'}, é necessário estar logado`,
    action: {
      label: 'Login',
      onClick: () => navigate({ to: '/login' }),
    },
  })
},
```

In `telemetrys-form.tsx`:
```typescript
// Before:
//   onError(error) {
//     description: `${error.response?.data.error}, é necessário estar logado`

// After:
onError(error) {
  toast('Erro ao adicionar medidor', {
    description: `${(error as PostMeters401)?.error ?? 'Erro desconhecido'}, é necessário estar logado`,
    action: {
      label: 'Login',
      onClick: () => navigate({ to: '/login' }),
    },
  })
},
```

In `telemetrys-edit-form.tsx`:
```typescript
// Before:
//   onError(error) {
//     description: `${error.response?.data.error}, é necessário estar logado`

// After:
onError(error) {
  toast('Erro ao editar', {
    description: `${(error as PutMetersId401)?.error ?? 'Erro desconhecido'}, é necessário estar logado`,
    action: {
      label: 'Login',
      onClick: () => navigate({ to: '/login' }),
    },
  })
},
```

**Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "telemetrys-|delete|edit-form"`
Expected: No errors

---

### Task 7: Fix `use-telemetry-data.ts` — remove `.data` unwrapping

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/gráficos/-hooks/use-telemetry-data.ts`

**Step 1: Fix `queryFn` — line 13-17**

```typescript
// Before:
//   queryFn: async () => {
//     const result = await getTelemetry({ meterId: params.meterId, period: params.period, aggregation })
//     return result.data
//   },

// After:
queryFn: async () => {
  const result = await getTelemetry({
    meterId: params.meterId,
    period: params.period,
    aggregation: selectedAggregation,
  })
  return result
},
```

**Step 2: Fix `select` — line 34-36**

The v7 pattern expects data as `{ data: GetTelemetry200DataItem[] }` but v8 returns `GetTelemetry200` directly (which has a `.data` property of type `GetTelemetry200DataItem[]`). The select function needs updating:

```typescript
// Before:
//   select: useMemo(
//     () => (data: { data: GetTelemetry200DataItem[] }) => data?.data ?? [],
//     []
//   ),

// After:
select: useMemo(
  () => (data: GetTelemetry200) => data?.data ?? [],
  []
),
```

**Step 3: Verify**

Run: `npx tsc --noEmit 2>&1 | grep use-telemetry-data`
Expected: No errors

---

### Task 8: Fix implicit `any` types

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/gráficos/route.tsx`
- Modify: `apps/web/src/routes/(dashboard)/settings/route.tsx`
- Modify: `apps/web/src/routes/(dashboard)/settings/$meterId.tsx`

**Step 1: Fix `gráficos/route.tsx` — lines 32 and 86**

These files use `.map((meter) =>` where `meter` has implicit `any` because `context.meters` may have lost its type inference. Add explicit type annotation:

```typescript
// Line 32 and 86 — add type import and annotate:
const metersOptions: Array<{ value: string; label: string }> = context.meters.map((meter: GetMeters200Item) => ({
```

Add import: `import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'`

**Step 2: Fix `settings/route.tsx` — lines 17, 54**

Same pattern — annotate the callback parameter:

```typescript
// Line 17:
const metersOptions = response.map((meter: GetMeters200Item) => ({

// Line 54:
{meters.map((meter: { value: string; label: string }) => (
```

Note: line 54 iterates over `meters` which is `Array<{ value: string; label: string }>` from the loader, not `GetMeters200Item[]`.

**Step 3: Fix `settings/$meterId.tsx` — line 9**

```typescript
// Before:
//   return meters.find((meter) => meter.id === meterId)

// After:
return meters.find((meter: GetMeters200Item) => meter.id === meterId)
```

Add import: `import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'`

**Step 4: Verify**

Run: `npx tsc --noEmit 2>&1 | grep -E "gráficos|settings"`
Expected: No errors

---

### Task 9: Fix `telemetria/route.tsx` implicit any

**Files:**
- Modify: `apps/web/src/routes/(dashboard)/telemetria/route.tsx`

**Step 1: Add type annotation on line 31**

```typescript
// Before:
//   {data?.map((list) => (

// After:
{data?.map((list: GetMeters200Item) => (
```

Add import: `import type { GetMeters200Item } from '@/http/gen/model/get-meters200-item.gen'`

**Step 2: Verify**

Run: `npx tsc --noEmit 2>&1 | grep telemetria/route`
Expected: No errors

---

### Task 10: Full build verification

**Step 1: Run TypeScript check**

Run: `cd apps/web && npx tsc --noEmit`
Expected: 0 errors

**Step 2: Run build**

Run: `cd apps/web && pnpm build`
Expected: Build succeeds

**Step 3: Commit all changes**

```bash
git add apps/web/src/http/custom-instance.ts apps/web/src/routes/ apps/web/fix-orval-nullable.js apps/web/orval.config.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): migrate from orval v7 to v8 and fix consuming code

- Upgrade orval from v7.21.0 to v8.9.0
- Add aliasCombinedTypes: true to orval.config.ts for backward compat
- Add post-generation fix script for nullable double-pipe bug (Zod v4 + Orval)
- Add auth interceptor to custom-instance.ts (replaces per-mutation axios config)
- Remove .data unwrapping from query/mutation results (customInstance already unwraps)
- Fix error type access (plain objects instead of AxiosError)
- Add last_measurement enum value to period-selector
- Fix all implicit any types in route loaders"
```