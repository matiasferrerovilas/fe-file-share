import "@testing-library/jest-dom";
import i18n from "../src/i18n/config";

// Deterministic language for tests regardless of jsdom's navigator locale — matches the app's
// own default (Spanish) rather than whatever the language detector happens to pick up.
await i18n.changeLanguage("es");

Object.defineProperty(window, "env", {
  value: {
    environment: "test",
    backend: {
      api: "http://localhost:8080",
      websocketUrl: "http://localhost:8080",
    },
    keycloak: {
      clientId: "test-client",
      realm: "test-realm",
      url: "http://localhost:8180",
    },
  },
  writable: true,
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill window.matchMedia — not available in jsdom but required by Ant Design Grid (Row/Col)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
