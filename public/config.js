const useLocalBackend = false;

const localBackend = {
  api: "http://localhost:8081/v1",
  websocketUrl: "http://localhost:8081",
};

const devBackend = {
  api: "https://file.eva-core.com/v1",
  websocketUrl: "https://file.eva-core.com",
};

window.env = {
  environment: "local",
  keycloak: {
    clientId: "fe-file-sharing",
    realm: "m2",
    url: "https://auth.eva-core.com",
  },
  backend: useLocalBackend ? localBackend : devBackend,
};
