import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Keycloak from "keycloak-js";

import { ReactKeycloakProvider } from "@react-keycloak/web";
import App from "./App";
import { AuthProvider } from "./auth/AuthProvider";

const keycloak = new Keycloak(window.env.keycloak);

createRoot(document.getElementById("root")!).render(
  <ReactKeycloakProvider
    authClient={keycloak}
    initOptions={{
      checkLoginIframe: false,
      enableLogging: false,
      onLoad: "login-required",
      pkceMethod: "S256",
    }}
    LoadingComponent={
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    }
    onEvent={(event, error) => {
      if (event === "onAuthError") {
        console.error("Error de autenticación:", error);
      }
      if (event === "onAuthSuccess") {
        console.debug("Autenticación exitosa");
      }
    }}
  >
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  </ReactKeycloakProvider>,
);
