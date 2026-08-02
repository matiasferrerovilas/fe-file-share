import "@testing-library/jest-dom";

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
