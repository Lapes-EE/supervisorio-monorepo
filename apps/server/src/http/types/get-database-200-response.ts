import z from 'zod'

export const getDatabase200ResponseDataSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  // Tensão
  tensaoFaseNeutroA: z.number().nullable().optional(),
  tensaoFaseNeutroB: z.number().nullable().optional(),
  tensaoFaseNeutroC: z.number().nullable().optional(),
  tensaoFaseFaseAB: z.number().nullable().optional(),
  tensaoFaseFaseBC: z.number().nullable().optional(),
  tensaoFaseFaseCA: z.number().nullable().optional(),
  // Frequência
  frequencia: z.number().nullable().optional(),
  // Correntes
  correnteA: z.number().nullable().optional(),
  correnteB: z.number().nullable().optional(),
  correnteC: z.number().nullable().optional(),
  correnteNeutroMedido: z.number().nullable().optional(),
  correnteNeutroCalculado: z.number().nullable().optional(),
  // Potência aparente
  potenciaAparenteA: z.number().nullable().optional(),
  potenciaAparenteB: z.number().nullable().optional(),
  potenciaAparenteC: z.number().nullable().optional(),
  potenciaAparenteTotalAritmetica: z.number().nullable().optional(),
  potenciaAparenteTotalVetorial: z.number().nullable().optional(),
  // Potência ativa - Fase A
  potenciaAtivaFundamentalA: z.number().nullable().optional(),
  potenciaAtivaHarmonicaA: z.number().nullable().optional(),
  potenciaAtivaFundamentalHarmonicaA: z.number().nullable().optional(),
  // Potência ativa - Fase B
  potenciaAtivaFundamentalB: z.number().nullable().optional(),
  potenciaAtivaHarmonicaB: z.number().nullable().optional(),
  potenciaAtivaFundamentalHarmonicaB: z.number().nullable().optional(),
  // Potência ativa - Fase C
  potenciaAtivaFundamentalC: z.number().nullable().optional(),
  potenciaAtivaHarmonicaC: z.number().nullable().optional(),
  potenciaAtivaFundamentalHarmonicaC: z.number().nullable().optional(),
  // Potência ativa - Total
  potenciaAtivaFundamentalTotal: z.number().nullable().optional(),
  potenciaAtivaHarmonicaTotal: z.number().nullable().optional(),
  potenciaAtivaFundamentalHarmonicaTotal: z.number().nullable().optional(),
  // Potência reativa
  potenciaReativaA: z.number().nullable().optional(),
  potenciaReativaB: z.number().nullable().optional(),
  potenciaReativaC: z.number().nullable().optional(),
  potenciaReativaTotalAritmetica: z.number().nullable().optional(),
  potenciaReativaTotalVetorial: z.number().nullable().optional(),
  // Ângulos
  anguloFaseA: z.number().nullable().optional(),
  anguloFaseB: z.number().nullable().optional(),
  anguloFaseC: z.number().nullable().optional(),
  phiFaseA: z.number().nullable().optional(),
  phiFaseB: z.number().nullable().optional(),
  phiFaseC: z.number().nullable().optional(),
  // Fator de potência
  fpRealFaseA: z.number().nullable().optional(),
  fpRealFaseB: z.number().nullable().optional(),
  fpRealFaseC: z.number().nullable().optional(),
  fpRealTotalAritmetica: z.number().nullable().optional(),
  fpRealTotalVetorial: z.number().nullable().optional(),
  fpDeslocamentoFaseA: z.number().nullable().optional(),
  fpDeslocamentoFaseB: z.number().nullable().optional(),
  fpDeslocamentoFaseC: z.number().nullable().optional(),
  fpDeslocamentoTotal: z.number().nullable().optional(),
  // THD
  thdTensaoA: z.number().nullable().optional(),
  thdTensaoB: z.number().nullable().optional(),
  thdTensaoC: z.number().nullable().optional(),
  thdCorrenteA: z.number().nullable().optional(),
  thdCorrenteB: z.number().nullable().optional(),
  thdCorrenteC: z.number().nullable().optional(),
  // Temperatura
  temperaturaSensorInterno: z.number().nullable().optional(),
})

export const getDatabase200ResponseSchema = z.object({
  data: z.array(getDatabase200ResponseDataSchema),
  total: z.number(),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
  nullCount: z.number(),
  aggregation: z.string(),
})

export type GetDatabase200ResponseSchema = z.infer<
  typeof getDatabase200ResponseSchema
>

export type GetDatabase200ResponseDataSchema = z.infer<
  typeof getDatabase200ResponseDataSchema
>
