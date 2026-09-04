import type { Formatted } from "@repo/telemetry"
import { eq } from "drizzle-orm"
import { db, sql } from "./connections"
import { measures } from "./schema/measures"
import { meters } from "./schema/meters"

export function getAllMeters() {
  return db
    .select({ ip: meters.ip })
    .from(meters)
    .where(eq(meters.enabled, true))
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
    anguloFaseA: data.angulo_fase_a,
    anguloFaseB: data.angulo_fase_b,
    anguloFaseC: data.angulo_fase_c,
    correnteA: data.corrente_a,
    correnteB: data.corrente_b,
    correnteC: data.corrente_c,
    correnteNeutroCalculado: data.corrente_de_neutro_calculado,
    correnteNeutroMedido: data.corrente_de_neutro_medido,
    fpDeslocamentoFaseA: data.fp_deslocamento_fase_a,
    fpDeslocamentoFaseB: data.fp_deslocamento_fase_b,
    fpDeslocamentoFaseC: data.fp_deslocamento_fase_c,
    fpDeslocamentoTotal: data.fp_deslocamento_total,
    fpRealFaseA: data.fp_real_fase_a,
    fpRealFaseB: data.fp_real_fase_b,
    fpRealFaseC: data.fp_real_fase_c,
    fpRealTotalAritmetica: data.fp_real_total_soma_aritmetica,
    fpRealTotalVetorial: data.fp_real_total_soma_vetorial,
    frequencia: data.frequencia,
    meterId,
    phiFaseA: data.phi_fase_a,
    phiFaseB: data.phi_fase_b,
    phiFaseC: data.phi_fase_c,
    potenciaAparenteA: data.potencia_aparente_a,
    potenciaAparenteB: data.potencia_aparente_b,
    potenciaAparenteC: data.potencia_aparente_c,
    potenciaAparenteTotalAritmetica:
      data.potencia_aparente_total_soma_aritmetica,
    potenciaAparenteTotalVetorial: data.potencia_aparente_total_soma_vetorial,
    potenciaAtivaFundamentalA: data.potencia_ativa_fundamental_a,
    potenciaAtivaFundamentalB: data.potencia_ativa_fundamental_b,
    potenciaAtivaFundamentalC: data.potencia_ativa_fundamental_c,
    potenciaAtivaFundamentalHarmonicaA:
      data.potencia_ativa_fundamental_harmonica_a,
    potenciaAtivaFundamentalHarmonicaB:
      data.potencia_ativa_fundamental_harmonica_b,
    potenciaAtivaFundamentalHarmonicaC:
      data.potencia_ativa_fundamental_harmonica_c,
    potenciaAtivaFundamentalHarmonicaTotal:
      data.potencia_ativa_fundamental_harmonica_total,
    potenciaAtivaFundamentalTotal: data.potencia_ativa_fundamental_total,
    potenciaAtivaHarmonicaA: data.potencia_ativa_harmonica_a,
    potenciaAtivaHarmonicaB: data.potencia_ativa_harmonica_b,
    potenciaAtivaHarmonicaC: data.potencia_ativa_harmonica_c,
    potenciaAtivaHarmonicaTotal: data.potencia_ativa_harmonica_total,
    potenciaReativaA: data.potencia_reativa_a,
    potenciaReativaB: data.potencia_reativa_b,
    potenciaReativaC: data.potencia_reativa_c,
    potenciaReativaTotalAritmetica: data.potencia_reativa_total_soma_aritmetica,
    potenciaReativaTotalVetorial: data.potencia_reativa_total_soma_vetorial,
    temperaturaSensorInterno: data.temperatura_sensor_interno,
    tensaoFaseFaseAB: data.tensao_fase_fase_ab,
    tensaoFaseFaseBC: data.tensao_fase_fase_bc,
    tensaoFaseFaseCA: data.tensao_fase_fase_ca,
    tensaoFaseNeutroA: data.tensao_fase_neutro_a,
    tensaoFaseNeutroB: data.tensao_fase_neutro_b,
    tensaoFaseNeutroC: data.tensao_fase_neutro_c,
    thdCorrenteA: data.thd_corrente_a,
    thdCorrenteB: data.thd_corrente_b,
    thdCorrenteC: data.thd_corrente_c,
    thdTensaoA: data.thd_tensao_a,
    thdTensaoB: data.thd_tensao_b,
    thdTensaoC: data.thd_tensao_c,
  }

  await db.insert(measures).values(measureData).execute()
  return { meterId }
}

export async function notifyTelemetryChange(meterId: number) {
  await sql`SELECT pg_notify('telemetry_changes', ${JSON.stringify({ meterId })})`
}
