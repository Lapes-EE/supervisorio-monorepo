import z from 'zod'

export const getDatabase200ResponseDataSchema = z.object({
  id: z.number().optional(),
  meterId: z.number(),
  time: z.string(),
  // Tensão
  tensaoFaseNeutroA: z.number().nullish(),
  tensaoFaseNeutroB: z.number().nullish(),
  tensaoFaseNeutroC: z.number().nullish(),
  tensaoFaseFaseAB: z.number().nullish(),
  tensaoFaseFaseBC: z.number().nullish(),
  tensaoFaseFaseCA: z.number().nullish(),
  // Frequência
  frequencia: z.number().nullish(),
  // Correntes
  correnteA: z.number().nullish(),
  correnteB: z.number().nullish(),
  correnteC: z.number().nullish(),
  correnteNeutroMedido: z.number().nullish(),
  correnteNeutroCalculado: z.number().nullish(),
  // Potência aparente
  potenciaAparenteA: z.number().nullish(),
  potenciaAparenteB: z.number().nullish(),
  potenciaAparenteC: z.number().nullish(),
  potenciaAparenteTotalAritmetica: z.number().nullish(),
  potenciaAparenteTotalVetorial: z.number().nullish(),
  // Potência ativa - Fase A
  potenciaAtivaFundamentalA: z.number().nullish(),
  potenciaAtivaHarmonicaA: z.number().nullish(),
  potenciaAtivaFundamentalHarmonicaA: z.number().nullish(),
  // Potência ativa - Fase B
  potenciaAtivaFundamentalB: z.number().nullish(),
  potenciaAtivaHarmonicaB: z.number().nullish(),
  potenciaAtivaFundamentalHarmonicaB: z.number().nullish(),
  // Potência ativa - Fase C
  potenciaAtivaFundamentalC: z.number().nullish(),
  potenciaAtivaHarmonicaC: z.number().nullish(),
  potenciaAtivaFundamentalHarmonicaC: z.number().nullish(),
  // Potência ativa - Total
  potenciaAtivaFundamentalTotal: z.number().nullish(),
  potenciaAtivaHarmonicaTotal: z.number().nullish(),
  potenciaAtivaFundamentalHarmonicaTotal: z.number().nullish(),
  // Potência reativa
  potenciaReativaA: z.number().nullish(),
  potenciaReativaB: z.number().nullish(),
  potenciaReativaC: z.number().nullish(),
  potenciaReativaTotalAritmetica: z.number().nullish(),
  potenciaReativaTotalVetorial: z.number().nullish(),
  // Ângulos
  anguloFaseA: z.number().nullish(),
  anguloFaseB: z.number().nullish(),
  anguloFaseC: z.number().nullish(),
  phiFaseA: z.number().nullish(),
  phiFaseB: z.number().nullish(),
  phiFaseC: z.number().nullish(),
  // Fator de potência
  fpRealFaseA: z.number().nullish(),
  fpRealFaseB: z.number().nullish(),
  fpRealFaseC: z.number().nullish(),
  fpRealTotalAritmetica: z.number().nullish(),
  fpRealTotalVetorial: z.number().nullish(),
  fpDeslocamentoFaseA: z.number().nullish(),
  fpDeslocamentoFaseB: z.number().nullish(),
  fpDeslocamentoFaseC: z.number().nullish(),
  fpDeslocamentoTotal: z.number().nullish(),
  // THD
  thdTensaoA: z.number().nullish(),
  thdTensaoB: z.number().nullish(),
  thdTensaoC: z.number().nullish(),
  thdCorrenteA: z.number().nullish(),
  thdCorrenteB: z.number().nullish(),
  thdCorrenteC: z.number().nullish(),
  // Temperatura
  temperaturaSensorInterno: z.number().nullish(),
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
