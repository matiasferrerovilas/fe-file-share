import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosInterceptorProvider } from "./api/AxiosInterceptorProvider";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import { WebSocketProvider } from "./websocket/WebSocketProvider";
import type { RootRouteContext } from "./routes/__root";
import { useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { AuthContext } from "./auth/AuthContext";
import { useKeycloak } from "@react-keycloak/web";
import esES from "antd/locale/es_ES";
import { ThemeProvider } from "./theme/ThemeProvider";
import { useTheme } from "./theme/ThemeContext";
import { useCurrentUser } from "./hooks/useCurrentUser";
import NotFound from "./components/NotFound";
import { WorkspaceProvider } from "./workspace/WorkspaceProvider";

declare module "@tanstack/react-router" {
  interface Register {
    context: RootRouteContext;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// El router se crea una sola vez como singleton fuera de cualquier componente.
// El contexto se actualiza via router.update() + router.invalidate() cuando
// el estado de auth cambia, evitando que los guards queden con el contexto frozen.
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: {
      authenticated: false,
      firstLogin: false,
      loading: true,
      keycloak: undefined as never,
    },
    skipAuth: false,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: NotFound,
});

function RouterWithAuth() {
  const auth = useContext(AuthContext);
  const { keycloak } = useKeycloak();
  const { data: currentUser, isSuccess: userReady } = useCurrentUser();
  const firstLogin = currentUser?.metadata?.isFirstLogin ?? false;

  // authRef permite leer el valor actual de auth dentro del efecto sin convertirlo
  // en dependencia reactiva — el objeto cambia de referencia en cada render aunque
  // sus valores primitivos (loading, authenticated) sean los mismos.
  const authRef = useRef(auth);
  useLayoutEffect(() => {
    authRef.current = auth;
  });

  // Cada vez que el estado de auth cambia (loading, firstLogin, authenticated)
  // actualizamos el contexto del router y lo invalidamos para que los beforeLoad
  // guards se re-ejecuten con los valores correctos.
  // IMPORTANTE: solo invalidamos cuando auth Y useCurrentUser están listos para
  // evitar que los guards corran con firstLogin=false antes de que /me resuelva.
  useEffect(() => {
    const currentAuth = authRef.current;
    router.update({
      context: {
        queryClient,
        auth: { ...currentAuth, firstLogin, keycloak },
        skipAuth: false,
      },
    });
    if (!currentAuth.loading && userReady) {
      router.invalidate();
    }
  }, [auth.loading, auth.authenticated, firstLogin, userReady, keycloak]);

  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  );
}

function ThemedApp() {
  const { isDark } = useTheme();

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        fontFamily: "Inter",
        borderRadius: 10,
      },
    }),
    [isDark],
  );

  return (
    <ConfigProvider locale={esES} theme={themeConfig}>
      <AntdApp>
        <AxiosInterceptorProvider>
          <QueryClientProvider client={queryClient}>
            <WebSocketProvider>
              <RouterWithAuth />
            </WebSocketProvider>
          </QueryClientProvider>
        </AxiosInterceptorProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
