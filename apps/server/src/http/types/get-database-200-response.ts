import z from 'zod'

export const telemetryMeasurementsSchema = z.object({
  // Tensão
  tensaoFaseNeutroA: z.number(),
  tensaoFaseNeutroB: z.number(),
  tensaoFaseNeutroC: z.number(),
  tensaoFaseFaseAB: z.number(),
  tensaoFaseFaseBC: z.number(),
  tensaoFaseFaseCA: z.number(),
  // Frequência
  frequencia: z.number(),
  // Correntes
  correnteA: z.number(),
  correnteB: z.number(),
  correnteC: z.number(),
  correnteNeutroMedido: z.number(),
  correnteNeutroCalculado: z.number(),
  // Potência aparente
  potenciaAparenteA: z.number(),
  potenciaAparenteB: z.number(),
  potenciaAparenteC: z.number(),
  potenciaAparenteTotalAritmetica: z.number(),
  potenciaAparenteTotalVetorial: z.number(),
  // Potência ativa - Fase A
  potenciaAtivaFundamentalA: z.number(),
  potenciaAtivaHarmonicaA: z.number(),
  potenciaAtivaFundamentalHarmonicaA: z.number(),
  // Potência ativa - Fase B
  potenciaAtivaFundamentalB: z.number(),
  potenciaAtivaHarmonicaB: z.number(),
  potenciaAtivaFundamentalHarmonicaB: z.number(),
  // Potência ativa - Fase C
  potenciaAtivaFundamentalC: z.number(),
  potenciaAtivaHarmonicaC: z.number(),
  potenciaAtivaFundamentalHarmonicaC: z.number(),
  // Potência ativa - Total
  potenciaAtivaFundamentalTotal: z.number(),
  potenciaAtivaHarmonicaTotal: z.number(),
  potenciaAtivaFundamentalHarmonicaTotal: z.number(),
  // Potência reativa
  potenciaReativaA: z.number(),
  potenciaReativaB: z.number(),
  potenciaReativaC: z.number(),
  potenciaReativaTotalAritmetica: z.number(),
  potenciaReativaTotalVetorial: z.number(),
  // Ângulos
  anguloFaseA: z.number(),
  anguloFaseB: z.number(),
  anguloFaseC: z.number(),
  phiFaseA: z.number(),
  phiFaseB: z.number(),
  phiFaseC: z.number(),
  // Fator de potência
  fpRealFaseA: z.number(),
  fpRealFaseB: z.number(),
  fpRealFaseC: z.number(),
  fpRealTotalAritmetica: z.number(),
  fpRealTotalVetorial: z.number(),
  fpDeslocamentoFaseA: z.number(),
  fpDeslocamentoFaseB: z.number(),
  fpDeslocamentoFaseC: z.number(),
  fpDeslocamentoTotal: z.number(),
  // THD
  thdTensaoA: z.number(),
  thdTensaoB: z.number(),
  thdTensaoC: z.number(),
  thdCorrenteA: z.number(),
  thdCorrenteB: z.number(),
  thdCorrenteC: z.number(),
  // Temperatura
  temperaturaSensorInterno: z.number(),
})

export const telemetryItemSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  status: z.enum(['success', 'error']),
  message: z.string().nullable(),
  measurements: telemetryMeasurementsSchema.nullable(),
})

export const getDatabase200ResponseSchema = z.object({
  data: z.array(telemetryItemSchema),
  total: z.number(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  nullCount: z.number(),
  aggregation: z.string(),
})

export type TelemetryMeasurementsSchema = z.infer<
  typeof telemetryMeasurementsSchema
>

export type TelemetryItemSchema = z.infer<typeof telemetryItemSchema>

export type GetDatabase200ResponseSchema = z.infer<
  typeof getDatabase200ResponseSchema
>
