import { Suspense, type ReactNode } from "react";
import { Spin } from "antd";

interface QueryLoadingBoundaryProps {
  children: ReactNode;
}

export const QueryLoadingBoundary = ({
  children,
}: QueryLoadingBoundaryProps) => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "64px",
            width: "100%",
          }}
        >
          <Spin size="large" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
