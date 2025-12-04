import z from 'zod'

export const getDatabase200ResponseDataSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  // Tensão
  tensaoFaseNeutroA: z.number().optional().nullable(),
  tensaoFaseNeutroB: z.number().optional().nullable(),
  tensaoFaseNeutroC: z.number().optional().nullable(),
  tensaoFaseFaseAB: z.number().optional().nullable(),
  tensaoFaseFaseBC: z.number().optional().nullable(),
  tensaoFaseFaseCA: z.number().optional().nullable(),
  // Frequência
  frequencia: z.number().optional().nullable(),
  // Correntes
  correnteA: z.number().optional().nullable(),
  correnteB: z.number().optional().nullable(),
  correnteC: z.number().optional().nullable(),
  correnteNeutroMedido: z.number().optional().nullable(),
  correnteNeutroCalculado: z.number().optional().nullable(),
  // Potência aparente
  potenciaAparenteA: z.number().optional().nullable(),
  potenciaAparenteB: z.number().optional().nullable(),
  potenciaAparenteC: z.number().optional().nullable(),
  potenciaAparenteTotalAritmetica: z.number().optional().nullable(),
  potenciaAparenteTotalVetorial: z.number().optional().nullable(),
  // Potência ativa - Fase A
  potenciaAtivaFundamentalA: z.number().optional().nullable(),
  potenciaAtivaHarmonicaA: z.number().optional().nullable(),
  potenciaAtivaFundamentalHarmonicaA: z.number().optional().nullable(),
  // Potência ativa - Fase B
  potenciaAtivaFundamentalB: z.number().optional().nullable(),
  potenciaAtivaHarmonicaB: z.number().optional().nullable(),
  potenciaAtivaFundamentalHarmonicaB: z.number().optional().nullable(),
  // Potência ativa - Fase C
  potenciaAtivaFundamentalC: z.number().optional().nullable(),
  potenciaAtivaHarmonicaC: z.number().optional().nullable(),
  potenciaAtivaFundamentalHarmonicaC: z.number().optional().nullable(),
  // Potência ativa - Total
  potenciaAtivaFundamentalTotal: z.number().optional().nullable(),
  potenciaAtivaHarmonicaTotal: z.number().optional().nullable(),
  potenciaAtivaFundamentalHarmonicaTotal: z.number().optional().nullable(),
  // Potência reativa
  potenciaReativaA: z.number().optional().nullable(),
  potenciaReativaB: z.number().optional().nullable(),
  potenciaReativaC: z.number().optional().nullable(),
  potenciaReativaTotalAritmetica: z.number().optional().nullable(),
  potenciaReativaTotalVetorial: z.number().optional().nullable(),
  // Ângulos
  anguloFaseA: z.number().optional().nullable(),
  anguloFaseB: z.number().optional().nullable(),
  anguloFaseC: z.number().optional().nullable(),
  phiFaseA: z.number().optional().nullable(),
  phiFaseB: z.number().optional().nullable(),
  phiFaseC: z.number().optional().nullable(),
  // Fator de potência
  fpRealFaseA: z.number().optional().nullable(),
  fpRealFaseB: z.number().optional().nullable(),
  fpRealFaseC: z.number().optional().nullable(),
  fpRealTotalAritmetica: z.number().optional().nullable(),
  fpRealTotalVetorial: z.number().optional().nullable(),
  fpDeslocamentoFaseA: z.number().optional().nullable(),
  fpDeslocamentoFaseB: z.number().optional().nullable(),
  fpDeslocamentoFaseC: z.number().optional().nullable(),
  fpDeslocamentoTotal: z.number().optional().nullable(),
  // THD
  thdTensaoA: z.number().optional().nullable(),
  thdTensaoB: z.number().optional().nullable(),
  thdTensaoC: z.number().optional().nullable(),
  thdCorrenteA: z.number().optional().nullable(),
  thdCorrenteB: z.number().optional().nullable(),
  thdCorrenteC: z.number().optional().nullable(),
  // Temperatura
  temperaturaSensorInterno: z.number().optional().nullable(),
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
