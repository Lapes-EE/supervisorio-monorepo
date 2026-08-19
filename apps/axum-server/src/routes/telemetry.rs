use std::collections::BTreeMap;

use axum::{
    extract::{Query, State},
    http::StatusCode,
    Json,
};
use chrono::{DateTime, Datelike, TimeZone, Utc};
use sqlx::{AssertSqlSafe, Column, Row};

use crate::{
    models::measures::{
        AVAILABLE_FIELDS, TelemetryAggregationOption, TelemetryItem, TelemetryPeriod,
        TelemetryPeriodOption, TelemetryQuery, TelemetryResponse,
    },
    AppState,
};

fn get_period_dates(period: TelemetryPeriodOption) -> (DateTime<Utc>, DateTime<Utc>) {
    let now = Utc::now();
    let local_now = chrono::Local::now();

    match period {
        TelemetryPeriodOption::LastMeasurement => (DateTime::UNIX_EPOCH, now),
        TelemetryPeriodOption::Last5Minutes => (now - chrono::Duration::minutes(5), now),
        TelemetryPeriodOption::Last30Minutes => (now - chrono::Duration::minutes(30), now),
        TelemetryPeriodOption::LastHour => (now - chrono::Duration::hours(1), now),
        TelemetryPeriodOption::Last6Hours => (now - chrono::Duration::hours(6), now),
        TelemetryPeriodOption::Last12Hours => (now - chrono::Duration::hours(12), now),
        TelemetryPeriodOption::Last24Hours => (now - chrono::Duration::hours(24), now),
        TelemetryPeriodOption::Today => {
            let start = local_now.date_naive().and_hms_opt(0, 0, 0).unwrap();
            let end = local_now.date_naive().and_hms_opt(23, 59, 59).unwrap();
            let start_utc = chrono::Local
                .from_local_datetime(&start)
                .single()
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|| now - chrono::Duration::hours(24));
            let end_utc = chrono::Local
                .from_local_datetime(&end)
                .single()
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or(now);
            (start_utc, end_utc)
        }
        TelemetryPeriodOption::Last7Days => (now - chrono::Duration::days(7), now),
        TelemetryPeriodOption::ThisMonth => {
            let start = chrono::NaiveDate::from_ymd_opt(local_now.year(), local_now.month(), 1)
                .unwrap()
                .and_hms_opt(0, 0, 0)
                .unwrap();
            let start_utc = chrono::Local
                .from_local_datetime(&start)
                .single()
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|| now - chrono::Duration::days(30));
            (start_utc, now)
        }
        TelemetryPeriodOption::Last30Days => (now - chrono::Duration::days(30), now),
        TelemetryPeriodOption::ThisYear => {
            let start = chrono::NaiveDate::from_ymd_opt(local_now.year(), 1, 1)
                .unwrap()
                .and_hms_opt(0, 0, 0)
                .unwrap();
            let start_utc = chrono::Local
                .from_local_datetime(&start)
                .single()
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|| now - chrono::Duration::days(365));
            (start_utc, now)
        }
    }
}

/// Obtain time telemetry data
#[utoipa::path(
    get,
    path = "/telemetry",
    tag = "Telemetry",
    params(
        TelemetryQuery
    ),
    responses(
        (status = 200, description = "Telemetry data obtained successfully", body = TelemetryResponse),
        (status = 400, description = "Invalid query parameters")
    )
)]
pub async fn get_telemetry(
    State(state): State<AppState>,
    Query(query): Query<TelemetryQuery>,
) -> Result<Json<TelemetryResponse>, (StatusCode, String)> {
    let (filter_start_date, filter_end_date) = if let Some(p) = query.period {
        get_period_dates(p)
    } else if let (Some(start), Some(end)) = (&query.start_date, &query.end_date) {
        let s = start
            .parse::<DateTime<Utc>>()
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
        let e = end
            .parse::<DateTime<Utc>>()
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;
        (s, e)
    } else {
        let now = Utc::now();
        (now - chrono::Duration::hours(24), now)
    };

    let requested_fields: Option<Vec<String>> = query.fields.as_ref().and_then(|f_str| {
        serde_json::from_str::<Vec<String>>(f_str).ok()
    });

    let agg_enum = query.aggregation.unwrap_or(TelemetryAggregationOption::Raw);
    let aggregation = agg_enum.as_str();
    let is_last_measurement = matches!(query.period, Some(TelemetryPeriodOption::LastMeasurement));

    let mut items: Vec<TelemetryItem> = Vec::new();
    let total: usize;

    if is_last_measurement {
        let rows = if let Some(meter_id) = query.meter_id {
            sqlx::query(
                r#"
                SELECT * FROM measures
                WHERE meter_id = $1
                ORDER BY time DESC
                LIMIT 1
                "#,
            )
            .bind(meter_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        } else {
            sqlx::query(
                r#"
                SELECT DISTINCT ON (meter_id) *
                FROM measures
                WHERE time > NOW() - INTERVAL '5 minutes'
                ORDER BY meter_id, time DESC
                "#,
            )
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        };

        total = rows.len();
        for row in rows {
            items.push(transform_row_to_telemetry_item(&row, &requested_fields));
        }
    } else if aggregation == "raw" {
        let (rows, count) = if let Some(meter_id) = query.meter_id {
            let data = sqlx::query(
                r#"
                SELECT * FROM measures
                WHERE time >= $1 AND time <= $2 AND meter_id = $3
                ORDER BY time ASC
                "#,
            )
            .bind(filter_start_date)
            .bind(filter_end_date)
            .bind(meter_id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            let cnt: i64 = sqlx::query_scalar(
                r#"
                SELECT COUNT(*) FROM measures
                WHERE time >= $1 AND time <= $2 AND meter_id = $3
                "#,
            )
            .bind(filter_start_date)
            .bind(filter_end_date)
            .bind(meter_id)
            .fetch_one(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            (data, cnt as usize)
        } else {
            let data = sqlx::query(
                r#"
                SELECT * FROM measures
                WHERE time >= $1 AND time <= $2
                ORDER BY time ASC
                "#,
            )
            .bind(filter_start_date)
            .bind(filter_end_date)
            .fetch_all(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            let cnt: i64 = sqlx::query_scalar(
                r#"
                SELECT COUNT(*) FROM measures
                WHERE time >= $1 AND time <= $2
                "#,
            )
            .bind(filter_start_date)
            .bind(filter_end_date)
            .fetch_one(&state.db)
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

            (data, cnt as usize)
        };

        total = count;
        for row in rows {
            items.push(transform_row_to_telemetry_item(&row, &requested_fields));
        }
    } else {
        // Aggregated query
        let fields_to_aggregate = if let Some(ref req) = requested_fields {
            AVAILABLE_FIELDS
                .iter()
                .filter(|(camel, _)| req.contains(&camel.to_string()))
                .copied()
                .collect::<Vec<_>>()
        } else {
            AVAILABLE_FIELDS.to_vec()
        };

        let mut select_clauses = Vec::new();
        for (camel, snake) in &fields_to_aggregate {
            select_clauses.push(format!("AVG({}) as \"{}\"", snake, camel));
        }

        let select_str = if select_clauses.is_empty() {
            String::new()
        } else {
            format!(", {}", select_clauses.join(", "))
        };

        let query_str = if let Some(_meter_id) = query.meter_id {
            format!(
                r#"
                SELECT
                    time_bucket($1::interval, time) as time,
                    meter_id as "meterId"
                    {}
                FROM measures
                WHERE time >= $2 AND time <= $3 AND meter_id = $4
                GROUP BY time_bucket($1::interval, time), meter_id
                ORDER BY time_bucket($1::interval, time) ASC
                "#,
                select_str
            )
        } else {
            format!(
                r#"
                SELECT
                    time_bucket($1::interval, time) as time,
                    meter_id as "meterId"
                    {}
                FROM measures
                WHERE time >= $2 AND time <= $3
                GROUP BY time_bucket($1::interval, time), meter_id
                ORDER BY time_bucket($1::interval, time) ASC
                "#,
                select_str
            )
        };

        let rows = if let Some(meter_id) = query.meter_id {
            sqlx::query(AssertSqlSafe(query_str.as_str()))
                .bind(aggregation)
                .bind(filter_start_date)
                .bind(filter_end_date)
                .bind(meter_id)
                .fetch_all(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        } else {
            sqlx::query(AssertSqlSafe(query_str.as_str()))
                .bind(aggregation)
                .bind(filter_start_date)
                .bind(filter_end_date)
                .fetch_all(&state.db)
                .await
                .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
        };

        total = rows.len();
        for row in rows {
            items.push(transform_row_to_telemetry_item(&row, &requested_fields));
        }
    }

    let start_date_str = if items.is_empty() {
        filter_start_date.to_rfc3339()
    } else {
        items[0].time.clone()
    };

    let end_date_str = if items.is_empty() {
        filter_end_date.to_rfc3339()
    } else {
        items.last().unwrap().time.clone()
    };

    let null_count = items.iter().filter(|i| i.status == "error").count();

    let final_aggregation = if is_last_measurement {
        "raw".to_string()
    } else {
        aggregation.to_string()
    };

    Ok(Json(TelemetryResponse {
        data: items,
        total,
        period: TelemetryPeriod {
            start_date: start_date_str,
            end_date: end_date_str,
        },
        null_count,
        aggregation: final_aggregation,
    }))
}

fn transform_row_to_telemetry_item(
    row: &sqlx::postgres::PgRow,
    requested_fields: &Option<Vec<String>>,
) -> TelemetryItem {
    let id: Option<i32> = row.try_get("id").ok();
    let meter_id: i32 = row
        .try_get("meter_id")
        .or_else(|_| row.try_get("meterId"))
        .unwrap_or(0);

    let time_val: String = if let Ok(t) = row.try_get::<DateTime<Utc>, _>("time") {
        t.to_rfc3339()
    } else if let Ok(t_str) = row.try_get::<String, _>("time") {
        t_str
    } else {
        Utc::now().to_rfc3339()
    };

    let mut measurements_map: BTreeMap<String, f64> = BTreeMap::new();
    let mut all_null = true;

    for (camel, snake) in AVAILABLE_FIELDS {
        // Try getting value by camel case name or snake case name
        let val_f64: Option<f64> = row
            .try_get::<Option<f32>, _>(*camel)
            .ok()
            .flatten()
            .map(|v| v as f64)
            .or_else(|| {
                row.try_get::<Option<f64>, _>(*camel)
                    .ok()
                    .flatten()
            })
            .or_else(|| {
                row.try_get::<Option<f32>, _>(*snake)
                    .ok()
                    .flatten()
                    .map(|v| v as f64)
            })
            .or_else(|| {
                row.try_get::<Option<f64>, _>(*snake)
                    .ok()
                    .flatten()
            });

        if let Some(v) = val_f64 {
            all_null = false;
            let value_to_insert = if let Some(fields) = requested_fields {
                if fields.contains(&camel.to_string()) { v } else { 0.0 }
            } else {
                v
            };
            measurements_map.insert(camel.to_string(), value_to_insert);
        } else {
            measurements_map.insert(camel.to_string(), 0.0);
        }
    }

    // Also check if any raw column in row was non-null
    if all_null {
        for col in row.columns() {
            let col_name = col.name();
            if col_name != "id" && col_name != "meter_id" && col_name != "meterId" && col_name != "time" {
                if row.try_get::<Option<f64>, _>(col_name).ok().flatten().is_some()
                    || row.try_get::<Option<f32>, _>(col_name).ok().flatten().is_some()
                {
                    all_null = false;
                    break;
                }
            }
        }
    }

    if all_null {
        TelemetryItem {
            id,
            meter_id,
            time: time_val,
            status: "error".to_string(),
            message: Some("Timeout na comunicação com o medidor".to_string()),
            measurements: None,
        }
    } else {
        TelemetryItem {
            id,
            meter_id,
            time: time_val,
            status: "success".to_string(),
            message: None,
            measurements: Some(measurements_map),
        }
    }
}
