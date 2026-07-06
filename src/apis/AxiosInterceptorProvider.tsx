// AxiosInterceptorProvider.tsx - Registra interceptor antes de renderizar children
import { useLayoutEffect, useRef } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { api } from "./axios";

export function AxiosInterceptorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { keycloak, initialized } = useKeycloak();
  const interceptorsRef = useRef<{ request: number; response: number } | null>(null);

  // useLayoutEffect se ejecuta sincrónicamente ANTES del paint, garantizando que
  // el interceptor esté registrado antes de que cualquier child pueda disparar un fetch.
  useLayoutEffect(() => {
    // Si Keycloak no está inicializado, no hacemos nada todavía
    if (!initialized) return;

    // Si ya tenemos interceptores registrados, no los volvemos a registrar
    if (interceptorsRef.current) return;

    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        if (keycloak.authenticated && keycloak.token) {
          try {
            // Renueva si expira en menos de 30 segundos
            await keycloak.updateToken(30);
            config.headers.Authorization = `Bearer ${keycloak.token}`;
          } catch (error) {
            console.error("Error renovando token:", error);
            keycloak.login();
            return Promise.reject(error);
          }
        } else if (!keycloak.authenticated) {
          // Si no está autenticado, redirige
          keycloak.login();
          return Promise.reject(new Error("No autenticado"));
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          keycloak.authenticated
        ) {
          originalRequest._retry = true;

          try {
            // Fuerza renovación
            await keycloak.updateToken(-1);

            if (keycloak.token) {
              originalRequest.headers.Authorization = `Bearer ${keycloak.token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error(
              "Error renovando token después de 401:",
              refreshError
            );
            keycloak.login();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    interceptorsRef.current = { request: requestInterceptor, response: responseInterceptor };

    return () => {
      if (interceptorsRef.current) {
        api.interceptors.request.eject(interceptorsRef.current.request);
        api.interceptors.response.eject(interceptorsRef.current.response);
        interceptorsRef.current = null;
      }
    };
  }, [keycloak, initialized]);

  // No renderiza children hasta que Keycloak esté inicializado
  // (el useLayoutEffect ya habrá registrado el interceptor para ese momento)
  if (!initialized) return null;

  return <>{children}</>;
}
