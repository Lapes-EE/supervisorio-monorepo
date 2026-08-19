use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;

#[derive(Debug, FromRow, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct Meters {
    pub id: i32,
    pub name: String,
    pub ip: String,
    pub description: Option<String>,
    pub isso_serial: String,
    pub enabled: bool,
    pub health: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, FromRow)]
pub struct MeterDbRow {
    pub id: i32,
    pub isso_serial: String,
    pub name: String,
    pub ip: String,
    pub description: Option<String>,
    pub active: bool,
    pub enabled: bool,
    pub health: Option<String>,
    pub failure_count: i32,
    pub last_failed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateMeterInput {
    pub name: String,
    pub ip: String,
    pub isso_serial: String,
    pub description: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct CreateMeterResponse {
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateMeterInput {
    pub name: String,
    pub ip: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct UpdateMeterStatusInput {
    pub enabled: bool,
}
