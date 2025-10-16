import z from 'zod'

export const getDatabase200ResponseDataSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  // Tensão
  tensaoFaseNeutroA: z.number().nullable(),
  tensaoFaseNeutroB: z.number().nullable(),
  tensaoFaseNeutroC: z.number().nullable(),
  tensaoFaseFaseAB: z.number().nullable(),
  tensaoFaseFaseBC: z.number().nullable(),
  tensaoFaseFaseCA: z.number().nullable(),
  // Frequência
  frequencia: z.number().nullable(),
  // Correntes
  correnteA: z.number().nullable(),
  correnteB: z.number().nullable(),
  correnteC: z.number().nullable(),
  correnteNeutroMedido: z.number().nullable(),
  correnteNeutroCalculado: z.number().nullable(),
  // Potência aparente
  potenciaAparenteA: z.number().nullable(),
  potenciaAparenteB: z.number().nullable(),
  potenciaAparenteC: z.number().nullable(),
  potenciaAparenteTotalAritmetica: z.number().nullable(),
  potenciaAparenteTotalVetorial: z.number().nullable(),
  // Potência ativa - Fase A
  potenciaAtivaFundamentalA: z.number().nullable(),
  potenciaAtivaHarmonicaA: z.number().nullable(),
  potenciaAtivaFundamentalHarmonicaA: z.number().nullable(),
  // Potência ativa - Fase B
  potenciaAtivaFundamentalB: z.number().nullable(),
  potenciaAtivaHarmonicaB: z.number().nullable(),
  potenciaAtivaFundamentalHarmonicaB: z.number().nullable(),
  // Potência ativa - Fase C
  potenciaAtivaFundamentalC: z.number().nullable(),
  potenciaAtivaHarmonicaC: z.number().nullable(),
  potenciaAtivaFundamentalHarmonicaC: z.number().nullable(),
  // Potência ativa - Total
  potenciaAtivaFundamentalTotal: z.number().nullable(),
  potenciaAtivaHarmonicaTotal: z.number().nullable(),
  potenciaAtivaFundamentalHarmonicaTotal: z.number().nullable(),
  // Potência reativa
  potenciaReativaA: z.number().nullable(),
  potenciaReativaB: z.number().nullable(),
  potenciaReativaC: z.number().nullable(),
  potenciaReativaTotalAritmetica: z.number().nullable(),
  potenciaReativaTotalVetorial: z.number().nullable(),
  // Ângulos
  anguloFaseA: z.number().nullable(),
  anguloFaseB: z.number().nullable(),
  anguloFaseC: z.number().nullable(),
  phiFaseA: z.number().nullable(),
  phiFaseB: z.number().nullable(),
  phiFaseC: z.number().nullable(),
  // Fator de potência
  fpRealFaseA: z.number().nullable(),
  fpRealFaseB: z.number().nullable(),
  fpRealFaseC: z.number().nullable(),
  fpRealTotalAritmetica: z.number().nullable(),
  fpRealTotalVetorial: z.number().nullable(),
  fpDeslocamentoFaseA: z.number().nullable(),
  fpDeslocamentoFaseB: z.number().nullable(),
  fpDeslocamentoFaseC: z.number().nullable(),
  fpDeslocamentoTotal: z.number().nullable(),
  // THD
  thdTensaoA: z.number().nullable(),
  thdTensaoB: z.number().nullable(),
  thdTensaoC: z.number().nullable(),
  thdCorrenteA: z.number().nullable(),
  thdCorrenteB: z.number().nullable(),
  thdCorrenteC: z.number().nullable(),
  // Temperatura
  temperaturaSensorInterno: z.number().nullable(),
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
