use std::collections::BTreeMap;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use utoipa::{IntoParams, ToSchema};

pub const AVAILABLE_FIELDS: &[(&str, &str)] = &[
    ("tensaoFaseNeutroA", "tensao_fase_neutro_a"),
    ("tensaoFaseNeutroB", "tensao_fase_neutro_b"),
    ("tensaoFaseNeutroC", "tensao_fase_neutro_c"),
    ("tensaoFaseFaseAB", "tensao_fase_fase_ab"),
    ("tensaoFaseFaseBC", "tensao_fase_fase_bc"),
    ("tensaoFaseFaseCA", "tensao_fase_fase_ca"),
    ("frequencia", "frequencia"),
    ("correnteA", "corrente_a"),
    ("correnteB", "corrente_b"),
    ("correnteC", "corrente_c"),
    ("correnteNeutroMedido", "corrente_de_neutro_medido"),
    ("correnteNeutroCalculado", "corrente_de_neutro_calculado"),
    ("potenciaAparenteA", "potencia_aparente_a"),
    ("potenciaAparenteB", "potencia_aparente_b"),
    ("potenciaAparenteC", "potencia_aparente_c"),
    ("potenciaAparenteTotalAritmetica", "potencia_aparente_total_soma_aritmetica"),
    ("potenciaAparenteTotalVetorial", "potencia_aparente_total_soma_vetorial"),
    ("potenciaAtivaFundamentalA", "potencia_ativa_fundamental_a"),
    ("potenciaAtivaHarmonicaA", "potencia_ativa_harmonica_a"),
    ("potenciaAtivaFundamentalHarmonicaA", "potencia_ativa_fundamental_harmonica_a"),
    ("potenciaAtivaFundamentalB", "potencia_ativa_fundamental_b"),
    ("potenciaAtivaHarmonicaB", "potencia_ativa_harmonica_b"),
    ("potenciaAtivaFundamentalHarmonicaB", "potencia_ativa_fundamental_harmonica_b"),
    ("potenciaAtivaFundamentalC", "potencia_ativa_fundamental_c"),
    ("potenciaAtivaHarmonicaC", "potencia_ativa_harmonica_c"),
    ("potenciaAtivaFundamentalHarmonicaC", "potencia_ativa_fundamental_harmonica_c"),
    ("potenciaAtivaFundamentalTotal", "potencia_ativa_fundamental_total"),
    ("potenciaAtivaHarmonicaTotal", "potencia_ativa_harmonica_total"),
    ("potenciaAtivaFundamentalHarmonicaTotal", "potencia_ativa_fundamental_harmonica_total"),
    ("potenciaReativaA", "potencia_reativa_a"),
    ("potenciaReativaB", "potencia_reativa_b"),
    ("potenciaReativaC", "potencia_reativa_c"),
    ("potenciaReativaTotalAritmetica", "potencia_reativa_total_soma_aritmetica"),
    ("potenciaReativaTotalVetorial", "potencia_reativa_total_soma_vetorial"),
    ("anguloFaseA", "angulo_fase_a"),
    ("anguloFaseB", "angulo_fase_b"),
    ("anguloFaseC", "angulo_fase_c"),
    ("phiFaseA", "phi_fase_a"),
    ("phiFaseB", "phi_fase_b"),
    ("phiFaseC", "phi_fase_c"),
    ("fpRealFaseA", "fp_real_fase_a"),
    ("fpRealFaseB", "fp_real_fase_b"),
    ("fpRealFaseC", "fp_real_fase_c"),
    ("fpRealTotalAritmetica", "fp_real_total_soma_aritmetica"),
    ("fpRealTotalVetorial", "fp_real_total_soma_vetorial"),
    ("fpDeslocamentoFaseA", "fp_deslocamento_fase_a"),
    ("fpDeslocamentoFaseB", "fp_deslocamento_fase_b"),
    ("fpDeslocamentoFaseC", "fp_deslocamento_fase_c"),
    ("fpDeslocamentoTotal", "fp_deslocamento_total"),
    ("thdTensaoA", "thd_tensao_a"),
    ("thdTensaoB", "thd_tensao_b"),
    ("thdTensaoC", "thd_tensao_c"),
    ("thdCorrenteA", "thd_corrente_a"),
    ("thdCorrenteB", "thd_corrente_b"),
    ("thdCorrenteC", "thd_corrente_c"),
    ("temperaturaSensorInterno", "temperatura_sensor_interno"),
];

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, ToSchema)]
pub enum TelemetryPeriodOption {
    #[serde(rename = "last_measurement")]
    LastMeasurement,
    #[serde(rename = "last_5_minutes")]
    Last5Minutes,
    #[serde(rename = "last_30_minutes")]
    Last30Minutes,
    #[serde(rename = "last_hour")]
    LastHour,
    #[serde(rename = "last_6_hours")]
    Last6Hours,
    #[serde(rename = "last_12_hours")]
    Last12Hours,
    #[serde(rename = "last_24_hours")]
    Last24Hours,
    #[serde(rename = "today")]
    Today,
    #[serde(rename = "last_7_days")]
    Last7Days,
    #[serde(rename = "this_month")]
    ThisMonth,
    #[serde(rename = "last_30_days")]
    Last30Days,
    #[serde(rename = "this_year")]
    ThisYear,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq, ToSchema)]
pub enum TelemetryAggregationOption {
    #[serde(rename = "raw")]
    Raw,
    #[serde(rename = "30 seconds")]
    ThirtySeconds,
    #[serde(rename = "1 minute")]
    OneMinute,
    #[serde(rename = "2 minute")]
    TwoMinutes,
    #[serde(rename = "5 minute")]
    FiveMinutes,
    #[serde(rename = "10 minute")]
    TenMinutes,
    #[serde(rename = "20 minute")]
    TwentyMinutes,
    #[serde(rename = "30 minute")]
    ThirtyMinutes,
    #[serde(rename = "1 hour")]
    OneHour,
    #[serde(rename = "3 hours")]
    ThreeHours,
    #[serde(rename = "1 day")]
    OneDay,
}

impl TelemetryAggregationOption {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Raw => "raw",
            Self::ThirtySeconds => "30 seconds",
            Self::OneMinute => "1 minute",
            Self::TwoMinutes => "2 minute",
            Self::FiveMinutes => "5 minute",
            Self::TenMinutes => "10 minute",
            Self::TwentyMinutes => "20 minute",
            Self::ThirtyMinutes => "30 minute",
            Self::OneHour => "1 hour",
            Self::ThreeHours => "3 hours",
            Self::OneDay => "1 day",
        }
    }
}

#[allow(dead_code)]
#[derive(Debug, FromRow, Serialize, Deserialize)]
pub struct Measure {
    pub id: i32,
    pub meter_id: i32,
    pub time: DateTime<Utc>,

    // Tensão
    pub tensao_fase_neutro_a: Option<f32>,
    pub tensao_fase_neutro_b: Option<f32>,
    pub tensao_fase_neutro_c: Option<f32>,
    pub tensao_fase_fase_ab: Option<f32>,
    pub tensao_fase_fase_bc: Option<f32>,
    pub tensao_fase_fase_ca: Option<f32>,

    // Frequência
    pub frequencia: Option<f32>,

    // Correntes
    pub corrente_a: Option<f32>,
    pub corrente_b: Option<f32>,
    pub corrente_c: Option<f32>,
    pub corrente_de_neutro_medido: Option<f32>,
    pub corrente_de_neutro_calculado: Option<f32>,

    // Potência aparente
    pub potencia_aparente_a: Option<f32>,
    pub potencia_aparente_b: Option<f32>,
    pub potencia_aparente_c: Option<f32>,
    pub potencia_aparente_total_soma_aritmetica: Option<f32>,
    pub potencia_aparente_total_soma_vetorial: Option<f32>,

    // Potência ativa
    pub potencia_ativa_fundamental_a: Option<f32>,
    pub potencia_ativa_harmonica_a: Option<f32>,
    pub potencia_ativa_fundamental_harmonica_a: Option<f32>,

    pub potencia_ativa_fundamental_b: Option<f32>,
    pub potencia_ativa_harmonica_b: Option<f32>,
    pub potencia_ativa_fundamental_harmonica_b: Option<f32>,

    pub potencia_ativa_fundamental_c: Option<f32>,
    pub potencia_ativa_harmonica_c: Option<f32>,
    pub potencia_ativa_fundamental_harmonica_c: Option<f32>,

    pub potencia_ativa_fundamental_total: Option<f32>,
    pub potencia_ativa_harmonica_total: Option<f32>,
    pub potencia_ativa_fundamental_harmonica_total: Option<f32>,

    // Potência reativa
    pub potencia_reativa_a: Option<f32>,
    pub potencia_reativa_b: Option<f32>,
    pub potencia_reativa_c: Option<f32>,
    pub potencia_reativa_total_soma_aritmetica: Option<f32>,
    pub potencia_reativa_total_soma_vetorial: Option<f32>,

    // Ângulos de fase
    pub angulo_fase_a: Option<f32>,
    pub angulo_fase_b: Option<f32>,
    pub angulo_fase_c: Option<f32>,

    // Ângulo phi
    pub phi_fase_a: Option<f32>,
    pub phi_fase_b: Option<f32>,
    pub phi_fase_c: Option<f32>,

    // Fator de potência real
    pub fp_real_fase_a: Option<f32>,
    pub fp_real_fase_b: Option<f32>,
    pub fp_real_fase_c: Option<f32>,
    pub fp_real_total_soma_aritmetica: Option<f32>,
    pub fp_real_total_soma_vetorial: Option<f32>,

    // Fator de potência por deslocamento
    pub fp_deslocamento_fase_a: Option<f32>,
    pub fp_deslocamento_fase_b: Option<f32>,
    pub fp_deslocamento_fase_c: Option<f32>,
    pub fp_deslocamento_total: Option<f32>,

    // THD (Distorção Harmônica Total)
    pub thd_tensao_a: Option<f32>,
    pub thd_tensao_b: Option<f32>,
    pub thd_tensao_c: Option<f32>,
    pub thd_corrente_a: Option<f32>,
    pub thd_corrente_b: Option<f32>,
    pub thd_corrente_c: Option<f32>,

    // Temperatura
    pub temperatura_sensor_interno: Option<f32>,
}

#[derive(Debug, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryQuery {
    pub meter_id: Option<i32>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    #[param(inline, nullable = false)]
    pub period: Option<TelemetryPeriodOption>,
    #[param(inline, nullable = false)]
    pub aggregation: Option<TelemetryAggregationOption>,
    pub fields: Option<String>,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryResponse {
    pub data: Vec<TelemetryItem>,
    pub total: usize,
    pub period: TelemetryPeriod,
    pub null_count: usize,
    pub aggregation: String,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryPeriod {
    pub start_date: String,
    pub end_date: String,
}

#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TelemetryItem {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<i32>,
    pub meter_id: i32,
    pub time: String,
    pub status: String,
    pub message: Option<String>,
    pub measurements: Option<BTreeMap<String, f64>>,
}
