import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Layout, theme } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import NavHeader from "../components/NavHeader";
import type { QueryClient } from "@tanstack/react-query";
import { memo } from "react";
import { QueryLoadingBoundary } from "../components/QueryLoadingBoundary";
import type { AuthContextState } from "../auth/AuthContext";
import type Keycloak from "keycloak-js";
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

function RootComponent() {
  const { auth } = Route.useRouteContext();
  const { token } = theme.useToken();
  const showChrome = !auth.firstLogin;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {showChrome && <MemoizedNavHeader />}
      <Layout style={{ flex: 1, minHeight: 0 }}>
        <Content style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <QueryLoadingBoundary>
            <Outlet />
          </QueryLoadingBoundary>
        </Content>
        {showChrome && (
          <Footer
            style={{
              textAlign: "center",
              padding: "12px 24px",
              fontSize: 12,
              color: token.colorTextTertiary,
              background: token.colorBgContainer,
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
