use argon2::{Argon2, PasswordHash, PasswordVerifier};
use axum::{
    extract::{FromRef, FromRequestParts, State},
    http::{request::Parts, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{models::users::User, AppState};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub struct AuthUser {
    #[allow(dead_code)]
    pub claims: Claims,
}

impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
    AppState: axum::extract::FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = AppState::from_ref(state);

        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|val| val.to_str().ok());

        let token = match auth_header {
            Some(header) if header.starts_with("Bearer ") => &header[7..],
            _ => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(json!({ "error": "Token inválido ou ausente" })),
                ));
            }
        };

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(app_state.jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({ "error": "Token inválido ou ausente" })),
            )
        })?;

        Ok(AuthUser {
            claims: token_data.claims,
        })
    }
}

pub fn create_jwt(sub: &str, secret: &str) -> Result<String, jsonwebtoken::errors::Error> {
    let expiration = chrono::Utc::now().timestamp() as usize + 10;
    let claims = Claims {
        sub: sub.to_string(),
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
}

pub fn base64_encode(input: &str) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bytes = input.as_bytes();
    let mut buf = String::new();
    let mut i = 0;
    while i < bytes.len() {
        let b0 = bytes[i] as u32;
        let b1 = if i + 1 < bytes.len() { bytes[i + 1] as u32 } else { 0 };
        let b2 = if i + 2 < bytes.len() { bytes[i + 2] as u32 } else { 0 };

        let triple = (b0 << 16) | (b1 << 8) | b2;

        buf.push(CHARSET[((triple >> 18) & 63) as usize] as char);
        buf.push(CHARSET[((triple >> 12) & 63) as usize] as char);
        if i + 1 < bytes.len() {
            buf.push(CHARSET[((triple >> 6) & 63) as usize] as char);
        } else {
            buf.push('=');
        }
        if i + 2 < bytes.len() {
            buf.push(CHARSET[(triple & 63) as usize] as char);
        } else {
            buf.push('=');
        }
        i += 3;
    }
    buf
}

pub fn base64_decode(input: &str) -> Result<String, ()> {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bytes = input.trim().as_bytes();
    let mut out = Vec::new();
    let mut buf: u32 = 0;
    let mut bits = 0;

    for &b in bytes {
        if b == b'=' {
            break;
        }
        let pos = CHARSET.iter().position(|&c| c == b).ok_or(())? as u32;
        buf = (buf << 6) | pos;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
        }
    }
    String::from_utf8(out).map_err(|_| ())
}

pub async fn docs_basic_auth(
    State(state): State<AppState>,
    req: axum::extract::Request,
    next: axum::middleware::Next,
) -> Result<Response, Response> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|val| val.to_str().ok());

    let mut authenticated = false;

    if let Some(header_val) = auth_header {
        if let Some(encoded) = header_val.strip_prefix("Basic ") {
            if let Ok(decoded_str) = base64_decode(encoded) {
                if let Some((username, password)) = decoded_str.split_once(':') {
                    let user_result = sqlx::query_as::<_, User>(
                        r#"SELECT id, username, password FROM "user" WHERE username = $1"#,
                    )
                    .bind(username)
                    .fetch_optional(&state.db)
                    .await;

                    if let Ok(Some(user_row)) = user_result {
                        if let Ok(parsed_hash) = PasswordHash::new(&user_row.password) {
                            if Argon2::default()
                                .verify_password(password.as_bytes(), &parsed_hash)
                                .is_ok()
                            {
                                authenticated = true;
                            }
                        }
                    }
                }
            }
        }
    }

    // Fallback check against static DOCS_USER & DOCS_PASSWORD (default admin/admin)
    if !authenticated {
        let expected_user = std::env::var("DOCS_USER").unwrap_or_else(|_| "admin".to_string());
        let expected_pass = std::env::var("DOCS_PASSWORD").unwrap_or_else(|_| "admin".to_string());
        let expected_auth = format!(
            "Basic {}",
            base64_encode(&format!("{}:{}", expected_user, expected_pass))
        );
        if auth_header == Some(expected_auth.as_str()) {
            authenticated = true;
        }
    }

    if authenticated {
        Ok(next.run(req).await)
    } else {
        let mut response =
            (StatusCode::UNAUTHORIZED, "Acesso restrito à documentação").into_response();
        response.headers_mut().insert(
            axum::http::header::WWW_AUTHENTICATE,
            axum::http::HeaderValue::from_static(
                "Basic realm=\"LAPES API Documentation\", charset=\"UTF-8\"",
            ),
        );
        Err(response)
    }
}
