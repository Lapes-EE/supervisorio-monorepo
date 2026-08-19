use std::{env, net::SocketAddr};

use axum_server::{AppState, create_app};
use sqlx::postgres::PgPoolOptions;
use tracing::info;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    dotenvy::dotenv().ok();

    let database_url =
        env::var("DATABASE_URL").expect("A variável DATABASE_URL deve ser configurada no .env");
    let jwt_secret = env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let port: u16 = env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3333);

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Não foi possível conectar ao banco de dados");

    let state = AppState {
        db: pool,
        jwt_secret,
    };

    let app = create_app(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    info!("Serving at:  http://{}", addr);
    info!("API docs: http://{}/docs", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
