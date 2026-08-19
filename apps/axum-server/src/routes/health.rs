use axum::{Json, response::IntoResponse};
use serde_json::json;

/// Check server health status
#[utoipa::path(
    get,
    path = "/health",
    tag = "Health",
    responses(
        (status = 200, description = "Health check status")
    )
)]
pub async fn get_health() -> impl IntoResponse {
    Json(json!({ "status": "ok" }))
}
