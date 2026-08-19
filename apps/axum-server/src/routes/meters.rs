use std::net::IpAddr;

use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use chrono::{DateTime, Utc};
use regex::Regex;
use serde_json::json;

use crate::{
    auth::AuthUser,
    models::meters::{CreateMeterInput, Meters, UpdateMeterInput, UpdateMeterStatusInput},
    AppState,
};

/// Register a new meter
#[utoipa::path(
    post,
    path = "/meters",
    tag = "Meters",
    request_body = CreateMeterInput,
    responses(
        (status = 201, description = "Meter created successfully"),
        (status = 400, description = "Invalid request payload"),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
pub async fn create_meter(
    _auth: AuthUser,
    State(state): State<AppState>,
    Json(payload): Json<CreateMeterInput>,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    if payload.name.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Meter name is required" })),
        ));
    }

    if payload.ip.parse::<IpAddr>().is_err() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "IP inválido" })),
        ));
    }

    let serial_regex = Regex::new(r"^[A-Z0-9]{3}(?:-[A-Z0-9]{3}){3}$").unwrap();
    if !serial_regex.is_match(&payload.isso_serial) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Serial inválido. Formato esperado: 258-A17-39C-D6A" })),
        ));
    }

    let created_at = sqlx::query_scalar::<_, DateTime<Utc>>(
        r#"
        INSERT INTO meters (name, ip, isso_serial, description)
        VALUES ($1, $2, $3, $4)
        RETURNING created_at
        "#,
    )
    .bind(&payload.name)
    .bind(&payload.ip)
    .bind(&payload.isso_serial)
    .bind(&payload.description)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    ))?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "createdAt": created_at.to_rfc3339() })),
    )
        .into_response())
}

/// List all registered meters
#[utoipa::path(
    get,
    path = "/meters",
    tag = "Meters",
    responses(
        (status = 200, description = "List all meters", body = [Meters])
    )
)]
pub async fn get_all_meters(
    State(state): State<AppState>,
) -> Result<Json<Vec<Meters>>, (StatusCode, String)> {
    let meters = sqlx::query_as::<_, Meters>(
        r#"
        SELECT id, name, ip, description, isso_serial, enabled, health::text as health
        FROM meters
        ORDER BY name ASC
        "#,
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(meters))
}

/// Update meter specifications
#[utoipa::path(
    put,
    path = "/meters/{id}",
    tag = "Meters",
    params(
        ("id" = i32, Path, description = "Meter ID")
    ),
    request_body = UpdateMeterInput,
    responses(
        (status = 200, description = "Meter updated successfully"),
        (status = 400, description = "Invalid payload"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Meter not found")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
pub async fn update_meter(
    _auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateMeterInput>,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    if payload.name.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Meter name is required" })),
        ));
    }

    if payload.ip.parse::<IpAddr>().is_err() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "IP inválido" })),
        ));
    }

    let result = sqlx::query_scalar::<_, i32>(
        r#"
        UPDATE meters
        SET name = $1, ip = $2, description = $3
        WHERE id = $4
        RETURNING id
        "#,
    )
    .bind(&payload.name)
    .bind(&payload.ip)
    .bind(&payload.description)
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    ))?;

    if result.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Meter not found" })),
        ));
    }

    Ok((StatusCode::OK, Json(json!({}))).into_response())
}

/// Toggle meter active status
#[utoipa::path(
    patch,
    path = "/meter/{id}",
    tag = "Meters",
    params(
        ("id" = i32, Path, description = "Meter ID")
    ),
    request_body = UpdateMeterStatusInput,
    responses(
        (status = 204, description = "Meter status updated"),
        (status = 400, description = "Bad request"),
        (status = 401, description = "Unauthorized")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
pub async fn update_meter_status(
    _auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<i32>,
    Json(payload): Json<UpdateMeterStatusInput>,
) -> Result<Response, StatusCode> {
    let result = if payload.enabled {
        sqlx::query(
            r#"
            UPDATE meters
            SET enabled = true, health = 'healthy'::health, failure_count = 0, last_failed_at = NULL
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&state.db)
        .await
    } else {
        sqlx::query(
            r#"
            UPDATE meters
            SET enabled = false
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&state.db)
        .await
    };

    match result {
        Ok(res) if res.rows_affected() > 0 => Ok(StatusCode::NO_CONTENT.into_response()),
        Ok(_) => Err(StatusCode::BAD_REQUEST),
        Err(_) => Err(StatusCode::BAD_REQUEST),
    }
}

/// Delete meter by ID
#[utoipa::path(
    delete,
    path = "/meters/{id}",
    tag = "Meters",
    params(
        ("id" = i32, Path, description = "Meter ID")
    ),
    responses(
        (status = 204, description = "Meter deleted"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "Meter not found")
    ),
    security(
        ("bearerAuth" = [])
    )
)]
pub async fn delete_meter(
    _auth: AuthUser,
    State(state): State<AppState>,
    Path(id): Path<i32>,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let result = sqlx::query_scalar::<_, i32>(
        r#"
        DELETE FROM meters
        WHERE id = $1
        RETURNING id
        "#,
    )
    .bind(id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "error": e.to_string() })),
    ))?;

    if result.is_none() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Medidor não encontrado  " })),
        ));
    }

    Ok(StatusCode::NO_CONTENT.into_response())
}
