use axum::{
    routing::{get, patch, post, put},
    Json, Router,
};
use tower_http::cors::{Any, CorsLayer};
use utoipa::{
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
    Modify, OpenApi,
};
use utoipa_scalar::{Scalar, Servable};

pub mod auth;
pub mod models;
pub mod routes;

use routes::{
    auth::login,
    health::get_health,
    meters::{create_meter, delete_meter, get_all_meters, update_meter, update_meter_status},
    telemetry::get_telemetry,
};

#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub jwt_secret: String,
}

#[derive(OpenApi)]
#[openapi(
    info(
        title = "LAPES - API",
        version = "1.0.0",
        description = "API for supervisory control and data acquisition"
    ),
    paths(
        routes::health::get_health,
        routes::auth::login,
        routes::meters::create_meter,
        routes::meters::get_all_meters,
        routes::meters::update_meter,
        routes::meters::update_meter_status,
        routes::meters::delete_meter,
        routes::telemetry::get_telemetry,
    ),
    components(
        schemas(
            models::users::LoginInput,
            models::meters::Meters,
            models::meters::CreateMeterInput,
            models::meters::UpdateMeterInput,
            models::meters::UpdateMeterStatusInput,
            models::measures::TelemetryResponse,
            models::measures::TelemetryPeriod,
            models::measures::TelemetryPeriodOption,
            models::measures::TelemetryAggregationOption,
            models::measures::TelemetryItem,
        )
    ),
    tags(
        (name = "LAPES", description = "API for supervisory control and data acquisition")
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;

struct SecurityAddon;

impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if let Some(components) = openapi.components.as_mut() {
            components.add_security_scheme(
                "bearerAuth",
                SecurityScheme::Http(
                    HttpBuilder::new()
                        .scheme(HttpAuthScheme::Bearer)
                        .bearer_format("JWT")
                        .build(),
                ),
            );
        }
    }
}

pub fn create_app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::PATCH,
            axum::http::Method::DELETE,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ACCEPT,
        ]);

    let openapi = ApiDoc::openapi();

    let docs_router = Router::new()
        .merge(Scalar::with_url("/docs", openapi.clone()))
        .route(
            "/openapi.json",
            get({
                let spec = openapi.clone();
                move || async move { Json(spec) }
            }),
        )
        .route_layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::docs_basic_auth,
        ));

    Router::new()
        .merge(docs_router)
        .route("/health", get(get_health))
        .route("/_health", get(get_health))
        .route("/sessions/password", post(login))
        .route("/meters", post(create_meter).get(get_all_meters))
        .route("/meters/{id}", put(update_meter).delete(delete_meter))
        .route("/meter/{id}", patch(update_meter_status))
        .route("/telemetry", get(get_telemetry))
        .layer(cors)
        .with_state(state)
}
