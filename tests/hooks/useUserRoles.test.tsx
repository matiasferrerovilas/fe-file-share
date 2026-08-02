import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: vi.fn(),
}));

import { useKeycloak } from "@react-keycloak/web";
import { useUserRoles } from "../../src/hooks/useUserRoles";

function mockRoles(roles: string[]) {
  vi.mocked(useKeycloak).mockReturnValue({
    keycloak: { tokenParsed: { realm_access: { roles } } },
  } as unknown as ReturnType<typeof useKeycloak>);
}

describe("useUserRoles", () => {
  it("retorna un array vacío de roles cuando no hay tokenParsed", () => {
    vi.mocked(useKeycloak).mockReturnValue({ keycloak: {} } as unknown as ReturnType<
      typeof useKeycloak
    >);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.roles).toEqual([]);
  });

  it("hasRole reconoce roles con prefijo ROLE_", () => {
    mockRoles(["ROLE_ADMIN"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasRole("ADMIN")).toBe(true);
  });

  it("hasRole reconoce roles sin prefijo", () => {
    mockRoles(["ADMIN"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasRole("ADMIN")).toBe(true);
  });

  it("hasRole retorna false cuando el rol no está presente", () => {
    mockRoles(["GUEST"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasRole("ADMIN")).toBe(false);
  });

  it("hasAnyRole retorna true si al menos uno de los roles coincide", () => {
    mockRoles(["FAMILY"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasAnyRole("ADMIN", "FAMILY")).toBe(true);
  });

  it("hasAnyRole retorna false si ninguno de los roles coincide", () => {
    mockRoles(["GUEST"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasAnyRole("ADMIN", "FAMILY")).toBe(false);
  });

  it("expone isAdmin, isFamily e isGuest en base al rol actual", () => {
    mockRoles(["ROLE_FAMILY"]);
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isFamily).toBe(true);
    expect(result.current.isGuest).toBe(false);
  });
});
