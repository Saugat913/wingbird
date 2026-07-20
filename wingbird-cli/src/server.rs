use std::{net::SocketAddr, sync::Arc};

use axum::{Json, Router, extract::State, routing::post};
use serde::Deserialize;
use tokio::{
    net::TcpListener,
    sync::{Mutex, oneshot},
};

#[derive(Deserialize)]
struct AuthCallback {
    pub token: String,
}

pub struct Server {
    listener: TcpListener,
    router: Router,
    signal_receiver: Arc<Mutex<oneshot::Receiver<String>>>,
}

#[derive(Debug, Clone)]
struct AppState {
    signal_sender: Arc<Mutex<Option<oneshot::Sender<String>>>>,
}

impl Server {
    pub async fn new() -> anyhow::Result<Self> {
        let sock_addr = SocketAddr::from(([127, 0, 0, 1], 0));
        let (signal_sender, signal_receiver) = oneshot::channel::<String>();
        let app_state = AppState {
            signal_sender: Arc::new(Mutex::new(Some(signal_sender))),
        };
        let listener = TcpListener::bind(sock_addr).await?;
        let router = Router::new().route("/callback", post(Self::callback_handler)).layer(tower_http::cors::CorsLayer::new()
            .allow_origin(tower_http::cors::Any)
            .allow_methods(tower_http::cors::Any)
            .allow_headers(tower_http::cors::Any)).with_state(app_state);
        Ok(Self {
            listener,
            router,
            signal_receiver: Arc::new(Mutex::new(signal_receiver)),
        })
    }

    pub async fn run(self) -> anyhow::Result<ServerHandle> {
        let (token_sender, token_receiver) = oneshot::channel();
        let sock_addr= self.listener.local_addr()?;
        tokio::spawn(async move {
            axum::serve(self.listener, self.router)
                .with_graceful_shutdown(async move {
                    let mut receiver = self.signal_receiver.lock().await;
                    let token = (&mut *receiver).await.unwrap();
                    token_sender.send(token).unwrap();
                })
                .await
                .unwrap();
        });
        Ok(ServerHandle {
            token_receiver: Arc::new(Mutex::new(Some(token_receiver))),
            sock_addr,
        })
    }

    async fn callback_handler(
        State(state): State<AppState>,
        Json(payload): Json<AuthCallback>,
    ) -> &'static str {
        let mut guard = state.signal_sender.lock().await;
        if let Some(tx) = guard.take() {
            let _ = tx.send(payload.token);
        }
        "Success! You can safely close this browser window and return to your terminal."
    }
}

pub struct ServerHandle {
    token_receiver: Arc<Mutex<Option<oneshot::Receiver<String>>>>,
    sock_addr:SocketAddr,
}

impl ServerHandle {
    pub async fn wait_for_token(self) -> anyhow::Result<String> {
        let token = self.token_receiver.lock().await.take().unwrap();
        let token = token.await?;
        Ok(token)
    }
    pub fn get_sock_port(&self) -> u16 {
        self.sock_addr.port()
    }
}
