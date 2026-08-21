import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import { TourRefsProvider } from "../../src/tour/TourRefsProvider";
import AppTour from "../../src/components/onboarding/AppTour";

vi.mock("../../src/hooks/useMarkTourSeen", () => ({
  useMarkTourSeen: vi.fn(),
}));

import { useMarkTourSeen } from "../../src/hooks/useMarkTourSeen";

const markSeenMock = vi.fn();

function renderTour(open: boolean, onClose = vi.fn()) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ConfigProvider locale={esES}>
      <TourRefsProvider>{children}</TourRefsProvider>
    </ConfigProvider>
  );
  return render(<AppTour open={open} onClose={onClose} />, { wrapper });
}

beforeEach(() => {
  vi.mocked(useMarkTourSeen).mockReturnValue({
    mutate: markSeenMock,
  } as unknown as ReturnType<typeof useMarkTourSeen>);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("AppTour", () => {
  it("no muestra contenido cuando open es false", () => {
    renderTour(false);
    expect(screen.queryByText("Tu árbol de archivos")).not.toBeInTheDocument();
  });

  it("muestra el primer paso (subida) cuando open es true", () => {
    renderTour(true);
    expect(screen.getByText("Tu árbol de archivos")).toBeInTheDocument();
  });

  it("avanza al siguiente paso al hacer click en Siguiente", async () => {
    const user = userEvent.setup();
    renderTour(true);

    await user.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => expect(screen.getByText("Buscar por nombre y contenido")).toBeInTheDocument());
  });

  it("incluye el toggle de vista y la papelera entre subida y compartir", async () => {
    const user = userEvent.setup();
    renderTour(true);

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole("button", { name: /siguiente/i }));
    }
    await waitFor(() => expect(screen.getByText("Vista de grilla o lista")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    await waitFor(() => expect(screen.getByText("Papelera")).toBeInTheDocument());
  });

  it("llega hasta el último paso (ayuda), sin target propio", async () => {
    const user = userEvent.setup();
    renderTour(true);

    for (let i = 0; i < 7; i++) {
      await user.click(screen.getByRole("button", { name: /siguiente/i }));
    }

    await waitFor(() => expect(screen.getByText("¿Necesitás más ayuda?")).toBeInTheDocument());
  });

  it("marca el tour como visto y llama a onClose al terminar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderTour(true, onClose);

    for (let i = 0; i < 7; i++) {
      await user.click(screen.getByRole("button", { name: /siguiente/i }));
    }
    await waitFor(() => expect(screen.getByText("¿Necesitás más ayuda?")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /finalizar/i }));

    expect(markSeenMock).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("marca el tour como visto y llama a onClose al cerrar antes de terminar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderTour(true, onClose);

    await user.click(screen.getByLabelText("Cerrar"));

    expect(markSeenMock).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
