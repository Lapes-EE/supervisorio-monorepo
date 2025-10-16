-- Custom SQL migration file, put your code below! --
-- Índice composto para filtros por meter_id e time (muito usado)
CREATE INDEX IF NOT EXISTS idx_measures_meter_time
  ON measures (meter_id, time DESC);

-- Índice apenas em time (para queries sem filtro de meter_id)
CREATE INDEX IF NOT EXISTS idx_measures_time
  ON measures (time DESC);

-- 4. Habilitar compressão para economizar espaço (dados > 7 dias)
ALTER TABLE measures SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'meter_id',
  timescaledb.compress_orderby = 'time DESC'
);

-- 5. Política de compressão automática (comprime dados > 7 dias)
SELECT add_compression_policy('measures', INTERVAL '7 days', if_not_exists => TRUE);

-- 6. Política de retenção (opcional - remove dados > 1 ano)
-- Descomente se quiser limpar dados antigos automaticamente
-- SELECT add_retention_policy('measures', INTERVAL '1 year', if_not_exists => TRUE);

-- ============================================
-- CONTINUOUS AGGREGATES (Agregações pré-computadas)
-- ============================================

-- Continuous Aggregate para dados agregados por 1 minuto
CREATE MATERIALIZED VIEW IF NOT EXISTS measures_1min
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 minute', time) AS bucket,
  meter_id,

  -- Tensão
  AVG(tensao_fase_neutro_a) AS avg_tensao_fase_neutro_a,
  AVG(tensao_fase_neutro_b) AS avg_tensao_fase_neutro_b,
  AVG(tensao_fase_neutro_c) AS avg_tensao_fase_neutro_c,
  AVG(tensao_fase_fase_ab) AS avg_tensao_fase_fase_ab,
  AVG(tensao_fase_fase_bc) AS avg_tensao_fase_fase_bc,
  AVG(tensao_fase_fase_ca) AS avg_tensao_fase_fase_ca,

  -- Frequência
  AVG(frequencia) AS avg_frequencia,

  -- Correntes
  AVG(corrente_a) AS avg_corrente_a,
  AVG(corrente_b) AS avg_corrente_b,
  AVG(corrente_c) AS avg_corrente_c,
  AVG(corrente_de_neutro_medido) AS avg_corrente_de_neutro_medido,
  AVG(corrente_de_neutro_calculado) AS avg_corrente_de_neutro_calculado,

  -- Potência aparente
  AVG(potencia_aparente_a) AS avg_potencia_aparente_a,
  AVG(potencia_aparente_b) AS avg_potencia_aparente_b,
  AVG(potencia_aparente_c) AS avg_potencia_aparente_c,
  AVG(potencia_aparente_total_soma_aritmetica) AS avg_potencia_aparente_total_soma_aritmetica,
  AVG(potencia_aparente_total_soma_vetorial) AS avg_potencia_aparente_total_soma_vetorial,

  -- Potência ativa
  AVG(potencia_ativa_fundamental_a) AS avg_potencia_ativa_fundamental_a,
  AVG(potencia_ativa_harmonica_a) AS avg_potencia_ativa_harmonica_a,
  AVG(potencia_ativa_fundamental_harmonica_a) AS avg_potencia_ativa_fundamental_harmonica_a,

  AVG(potencia_ativa_fundamental_b) AS avg_potencia_ativa_fundamental_b,
  AVG(potencia_ativa_harmonica_b) AS avg_potencia_ativa_harmonica_b,
  AVG(potencia_ativa_fundamental_harmonica_b) AS avg_potencia_ativa_fundamental_harmonica_b,

  AVG(potencia_ativa_fundamental_c) AS avg_potencia_ativa_fundamental_c,
  AVG(potencia_ativa_harmonica_c) AS avg_potencia_ativa_harmonica_c,
  AVG(potencia_ativa_fundamental_harmonica_c) AS avg_potencia_ativa_fundamental_harmonica_c,

  AVG(potencia_ativa_fundamental_total) AS avg_potencia_ativa_fundamental_total,
  AVG(potencia_ativa_harmonica_total) AS avg_potencia_ativa_harmonica_total,
  AVG(potencia_ativa_fundamental_harmonica_total) AS avg_potencia_ativa_fundamental_harmonica_total,

  -- Potência reativa
  AVG(potencia_reativa_a) AS avg_potencia_reativa_a,
  AVG(potencia_reativa_b) AS avg_potencia_reativa_b,
  AVG(potencia_reativa_c) AS avg_potencia_reativa_c,
  AVG(potencia_reativa_total_soma_aritmetica) AS avg_potencia_reativa_total_soma_aritmetica,
  AVG(potencia_reativa_total_soma_vetorial) AS avg_potencia_reativa_total_soma_vetorial,

  -- Ângulos de fase
  AVG(angulo_fase_a) AS avg_angulo_fase_a,
  AVG(angulo_fase_b) AS avg_angulo_fase_b,
  AVG(angulo_fase_c) AS avg_angulo_fase_c,

  -- Ângulo phi
  AVG(phi_fase_a) AS avg_phi_fase_a,
  AVG(phi_fase_b) AS avg_phi_fase_b,
  AVG(phi_fase_c) AS avg_phi_fase_c,

  -- Fator de potência real
  AVG(fp_real_fase_a) AS avg_fp_real_fase_a,
  AVG(fp_real_fase_b) AS avg_fp_real_fase_b,
  AVG(fp_real_fase_c) AS avg_fp_real_fase_c,
  AVG(fp_real_total_soma_aritmetica) AS avg_fp_real_total_soma_aritmetica,
  AVG(fp_real_total_soma_vetorial) AS avg_fp_real_total_soma_vetorial,

  -- Fator de potência por deslocamento
  AVG(fp_deslocamento_fase_a) AS avg_fp_deslocamento_fase_a,
  AVG(fp_deslocamento_fase_b) AS avg_fp_deslocamento_fase_b,
  AVG(fp_deslocamento_fase_c) AS avg_fp_deslocamento_fase_c,
  AVG(fp_deslocamento_total) AS avg_fp_deslocamento_total,

  -- THD (Distorção Harmônica Total)
  AVG(thd_tensao_a) AS avg_thd_tensao_a,
  AVG(thd_tensao_b) AS avg_thd_tensao_b,
  AVG(thd_tensao_c) AS avg_thd_tensao_c,
  AVG(thd_corrente_a) AS avg_thd_corrente_a,
  AVG(thd_corrente_b) AS avg_thd_corrente_b,
  AVG(thd_corrente_c) AS avg_thd_corrente_c,

  -- Temperatura
  AVG(temperatura_sensor_interno) AS avg_temperatura_sensor_interno,

  -- Contador de amostras
  COUNT(*) AS num_samples

FROM measures
GROUP BY bucket, meter_id;


-- Adiciona política de refresh automática (atualiza a cada 1 minuto)
SELECT add_continuous_aggregate_policy('measures_1min',
  start_offset => INTERVAL '2 hours',
  end_offset => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists => TRUE
);
