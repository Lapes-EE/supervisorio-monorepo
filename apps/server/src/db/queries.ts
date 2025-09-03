import { eq } from 'drizzle-orm'
import type { Formatted } from '@/http/types/get-telemetry-response'
import { db } from './connections'
import { measures } from './schema/measures'
import { meters } from './schema/meters'

export function getAllMeters() {
  return db
    .select({ ip: meters.ip })
    .from(meters)
    .where(eq(meters.active, true))
}

export async function insertMeasure(data: Partial<Formatted>, ip: string) {
  const meter = await db
    .select()
    .from(meters)
    .where(eq(meters.ip, ip))
    .limit(1)
    .execute()

  if (meter.length === 0) {
    throw new Error(`Medidor com IP ${ip} não encontrado`)
  }

  const meterId = meter[0].id

  const measureData = {
    meterId,
    tensaoFaseNeutroA: data.tensao_fase_neutro_a,
    tensaoFaseNeutroB: data.tensao_fase_neutro_b,
    tensaoFaseNeutroC: data.tensao_fase_neutro_c,
    tensaoFaseFaseAB: data.tensao_fase_fase_ab,
    tensaoFaseFaseBC: data.tensao_fase_fase_bc,
    tensaoFaseFaseCA: data.tensao_fase_fase_ca,
    frequencia: data.frequencia,
    correnteA: data.corrente_a,
    correnteB: data.corrente_b,
    correnteC: data.corrente_c,
    correnteNeutroMedido: data.corrente_de_neutro_medido,
    correnteNeutroCalculado: data.corrente_de_neutro_calculado,
    potenciaAparenteA: data.potencia_aparente_a,
    potenciaAparenteB: data.potencia_aparente_b,
    potenciaAparenteC: data.potencia_aparente_c,
    potenciaAparenteTotalAritmetica:
      data.potencia_aparente_total_soma_aritmetica,
    potenciaAparenteTotalVetorial: data.potencia_aparente_total_soma_vetorial,
    potenciaAtivaFundamentalA: data.potencia_ativa_fundamental_a,
    potenciaAtivaHarmonicaA: data.potencia_ativa_harmonica_a,
    potenciaAtivaFundamentalHarmonicaA:
      data.potencia_ativa_fundamental_harmonica_a,
    potenciaAtivaFundamentalB: data.potencia_ativa_fundamental_b,
    potenciaAtivaHarmonicaB: data.potencia_ativa_harmonica_b,
    potenciaAtivaFundamentalHarmonicaB:
      data.potencia_ativa_fundamental_harmonica_b,
    potenciaAtivaFundamentalC: data.potencia_ativa_fundamental_c,
    potenciaAtivaHarmonicaC: data.potencia_ativa_harmonica_c,
    potenciaAtivaFundamentalHarmonicaC:
      data.potencia_ativa_fundamental_harmonica_c,
    potenciaAtivaFundamentalTotal: data.potencia_ativa_fundamental_total,
    potenciaAtivaHarmonicaTotal: data.potencia_ativa_harmonica_total,
    potenciaAtivaFundamentalHarmonicaTotal:
      data.potencia_ativa_fundamental_harmonica_total,
    potenciaReativaA: data.potencia_reativa_a,
    potenciaReativaB: data.potencia_reativa_b,
    potenciaReativaC: data.potencia_reativa_c,
    potenciaReativaTotalAritmetica: data.potencia_reativa_total_soma_aritmetica,
    potenciaReativaTotalVetorial: data.potencia_reativa_total_soma_vetorial,
    anguloFaseA: data.angulo_fase_a,
    anguloFaseB: data.angulo_fase_b,
    anguloFaseC: data.angulo_fase_c,
    phiFaseA: data.phi_fase_a,
    phiFaseB: data.phi_fase_b,
    phiFaseC: data.phi_fase_c,
    fpRealFaseA: data.fp_real_fase_a,
    fpRealFaseB: data.fp_real_fase_b,
    fpRealFaseC: data.fp_real_fase_c,
    fpRealTotalAritmetica: data.fp_real_total_soma_aritmetica,
    fpRealTotalVetorial: data.fp_real_total_soma_vetorial,
    fpDeslocamentoFaseA: data.fp_deslocamento_fase_a,
    fpDeslocamentoFaseB: data.fp_deslocamento_fase_b,
    fpDeslocamentoFaseC: data.fp_deslocamento_fase_c,
    fpDeslocamentoTotal: data.fp_deslocamento_total,
    thdTensaoA: data.thd_tensao_a,
    thdTensaoB: data.thd_tensao_b,
    thdTensaoC: data.thd_tensao_c,
    thdCorrenteA: data.thd_corrente_a,
    thdCorrenteB: data.thd_corrente_b,
    thdCorrenteC: data.thd_corrente_c,
    temperaturaSensorInterno: data.temperatura_sensor_interno,
  }

  return db.insert(measures).values(measureData).execute()
}
