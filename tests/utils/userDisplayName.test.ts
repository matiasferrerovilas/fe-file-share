import { describe, it, expect } from "vitest";
import { getUserDisplayName } from "../../src/utils/userDisplayName";

describe("getUserDisplayName", () => {
  it("retorna nombre completo cuando tiene givenName y familyName", () => {
    expect(
      getUserDisplayName({
        givenName: "Matias",
        familyName: "Ferrero Vilas",
        email: "matigfv@gmail.com",
      }),
    ).toBe("Matias Ferrero Vilas");
  });

  it("retorna solo givenName cuando no tiene familyName", () => {
    expect(
      getUserDisplayName({ givenName: "Matias", familyName: null, email: "matigfv@gmail.com" }),
    ).toBe("Matias");
  });

  it("retorna solo givenName cuando familyName es undefined", () => {
    expect(getUserDisplayName({ givenName: "Matias", email: "matigfv@gmail.com" })).toBe("Matias");
  });

  it("retorna email cuando no tiene givenName", () => {
    expect(
      getUserDisplayName({
        givenName: null,
        familyName: "Ferrero Vilas",
        email: "matigfv@gmail.com",
      }),
    ).toBe("matigfv@gmail.com");
  });

  it("retorna string vacío cuando no tiene ningún dato", () => {
    expect(getUserDisplayName({ givenName: null, familyName: null, email: null })).toBe("");
  });

  it("retorna string vacío cuando el objeto está vacío", () => {
    expect(getUserDisplayName({})).toBe("");
  });

  it("trimea espacios extra en el nombre completo", () => {
    expect(
      getUserDisplayName({ givenName: "Matias", familyName: "  ", email: "matigfv@gmail.com" }),
    ).toBe("Matias");
  });
});
