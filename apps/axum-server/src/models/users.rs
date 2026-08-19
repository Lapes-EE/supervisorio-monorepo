use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use utoipa::ToSchema;
use uuid::Uuid;

#[allow(dead_code)]
#[derive(Debug, FromRow, Serialize, Deserialize, ToSchema)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct LoginInput {
    pub username: String,
    pub password: String,
}

#[allow(dead_code)]
#[derive(Debug, Serialize, ToSchema)]
pub struct LoginResponse {
    pub token: String,
}
