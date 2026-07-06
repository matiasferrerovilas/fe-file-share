import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout, Grid } from "antd"; // 👈 Importar Grid
import { Content, Footer } from "antd/es/layout/layout";
import NavHeader from "../components/NavHeader";
import type { QueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { QueryLoadingBoundary } from "../components/QueryLoadingBoundary";
import type { AuthContextState } from "../apis/auth/AuthContext";
import type Keycloak from "keycloak-js";
const { useBreakpoint } = Grid;
import module from "../../package.json";

export interface RootRouteContext {
  queryClient: QueryClient;
  auth: AuthContextState & {
    firstLogin: boolean;
    keycloak: Keycloak;
  };
  skipAuth: boolean;
}
const MemoizedNavHeader = memo(NavHeader);

const ContentWrapper: React.FC = () => {
  const screens = useBreakpoint();

  const paddingHorizontal = screens.lg ? 100 : screens.md ? 40 : 16;

  return (
    <div
      style={{
        paddingInline: paddingHorizontal,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Outlet />
    </div>
  );
};

function RootComponent() {
  const { auth } = Route.useRouteContext();
  const showChrome = !auth.firstLogin;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showChrome && <MemoizedNavHeader />}
      <Layout>
        <Content>
          <QueryLoadingBoundary>
            <ContentWrapper />
          </QueryLoadingBoundary>
        </Content>
        {showChrome && (
          <Footer
            style={{
              textAlign: "center",
              backgroundColor: "var(--fondo-general)",
              marginTop: 32,
            }}
          >
            M-1 ©{new Date().getFullYear()} Created by Mati FV v{module.version}
          </Footer>
        )}
      </Layout>
    </Layout>
  );
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootComponent,
});
