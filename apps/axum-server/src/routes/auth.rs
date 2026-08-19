use argon2::{Argon2, PasswordHash, PasswordVerifier};
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

use crate::{
    auth::create_jwt,
    models::users::{LoginInput, User},
    AppState,
};

/// Authenticate user and issue JWT token
#[utoipa::path(
    post,
    path = "/sessions/password",
    tag = "Auth",
    request_body = LoginInput,
    responses(
        (status = 201, description = "JWT session token created"),
        (status = 400, description = "Invalid credentials")
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginInput>,
) -> Result<Response, (StatusCode, String)> {
    let user = sqlx::query_as::<_, User>(
        r#"SELECT id, username, password FROM "user" WHERE username = $1"#,
    )
    .bind(&payload.username)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let user = match user {
        Some(u) => u,
        None => return Ok((StatusCode::BAD_REQUEST, "Credenciais inválidas").into_response()),
    };

    let parsed_hash = match PasswordHash::new(&user.password) {
        Ok(h) => h,
        Err(_) => return Ok((StatusCode::BAD_REQUEST, "Credenciais inválidas").into_response()),
    };

    if Argon2::default()
        .verify_password(payload.password.as_bytes(), &parsed_hash)
        .is_err()
    {
        return Ok((StatusCode::BAD_REQUEST, "Credenciais inválidas").into_response());
    }

    let token = create_jwt(&user.id.to_string(), &state.jwt_secret)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(json!({ "token": token }))).into_response())
}
