import { integer, pgTable, real, serial, timestamp } from 'drizzle-orm/pg-core'
import { meters } from './meters'

export const measures = pgTable('measures', {
  id: serial('id').primaryKey(),

  meterId: integer('meter_id')
    .notNull()
    .references(() => meters.id, { onDelete: 'cascade' }),

  time: timestamp('time', { withTimezone: false, mode: 'string' })
    .notNull()
    .defaultNow(),

  // Tensão
  tensaoFaseNeutroA: real('tensao_fase_neutro_a'),
  tensaoFaseNeutroB: real('tensao_fase_neutro_b'),
  tensaoFaseNeutroC: real('tensao_fase_neutro_c'),
  tensaoFaseFaseAB: real('tensao_fase_fase_ab'),
  tensaoFaseFaseBC: real('tensao_fase_fase_bc'),
  tensaoFaseFaseCA: real('tensao_fase_fase_ca'),

  // Frequência
  frequencia: real('frequencia'),

  // Correntes
  correnteA: real('corrente_a'),
  correnteB: real('corrente_b'),
  correnteC: real('corrente_c'),
  correnteNeutroMedido: real('corrente_de_neutro_medido'),
  correnteNeutroCalculado: real('corrente_de_neutro_calculado'),

  // Potência aparente
  potenciaAparenteA: real('potencia_aparente_a'),
  potenciaAparenteB: real('potencia_aparente_b'),
  potenciaAparenteC: real('potencia_aparente_c'),
  potenciaAparenteTotalAritmetica: real(
    'potencia_aparente_total_soma_aritmetica'
  ),
  potenciaAparenteTotalVetorial: real('potencia_aparente_total_soma_vetorial'),

  // Potência ativa
  potenciaAtivaFundamentalA: real('potencia_ativa_fundamental_a'),
  potenciaAtivaHarmonicaA: real('potencia_ativa_harmonica_a'),
  potenciaAtivaFundamentalHarmonicaA: real(
    'potencia_ativa_fundamental_harmonica_a'
  ),

  potenciaAtivaFundamentalB: real('potencia_ativa_fundamental_b'),
  potenciaAtivaHarmonicaB: real('potencia_ativa_harmonica_b'),
  potenciaAtivaFundamentalHarmonicaB: real(
    'potencia_ativa_fundamental_harmonica_b'
  ),

  potenciaAtivaFundamentalC: real('potencia_ativa_fundamental_c'),
  potenciaAtivaHarmonicaC: real('potencia_ativa_harmonica_c'),
  potenciaAtivaFundamentalHarmonicaC: real(
    'potencia_ativa_fundamental_harmonica_c'
  ),

  potenciaAtivaFundamentalTotal: real('potencia_ativa_fundamental_total'),
  potenciaAtivaHarmonicaTotal: real('potencia_ativa_harmonica_total'),
  potenciaAtivaFundamentalHarmonicaTotal: real(
    'potencia_ativa_fundamental_harmonica_total'
  ),

  // Potência reativa
  potenciaReativaA: real('potencia_reativa_a'),
  potenciaReativaB: real('potencia_reativa_b'),
  potenciaReativaC: real('potencia_reativa_c'),
  potenciaReativaTotalAritmetica: real(
    'potencia_reativa_total_soma_aritmetica'
  ),
  potenciaReativaTotalVetorial: real('potencia_reativa_total_soma_vetorial'),

  // Ângulos de fase
  anguloFaseA: real('angulo_fase_a'),
  anguloFaseB: real('angulo_fase_b'),
  anguloFaseC: real('angulo_fase_c'),

  // Ângulo phi
  phiFaseA: real('phi_fase_a'),
  phiFaseB: real('phi_fase_b'),
  phiFaseC: real('phi_fase_c'),

  // Fator de potência real
  fpRealFaseA: real('fp_real_fase_a'),
  fpRealFaseB: real('fp_real_fase_b'),
  fpRealFaseC: real('fp_real_fase_c'),
  fpRealTotalAritmetica: real('fp_real_total_soma_aritmetica'),
  fpRealTotalVetorial: real('fp_real_total_soma_vetorial'),

  // Fator de potência por deslocamento
  fpDeslocamentoFaseA: real('fp_deslocamento_fase_a'),
  fpDeslocamentoFaseB: real('fp_deslocamento_fase_b'),
  fpDeslocamentoFaseC: real('fp_deslocamento_fase_c'),
  fpDeslocamentoTotal: real('fp_deslocamento_total'),

  // THD (Distorção Harmônica Total)
  thdTensaoA: real('thd_tensao_a'),
  thdTensaoB: real('thd_tensao_b'),
  thdTensaoC: real('thd_tensao_c'),
  thdCorrenteA: real('thd_corrente_a'),
  thdCorrenteB: real('thd_corrente_b'),
  thdCorrenteC: real('thd_corrente_c'),

  // Temperatura
  temperaturaSensorInterno: real('temperatura_sensor_interno'),
})
