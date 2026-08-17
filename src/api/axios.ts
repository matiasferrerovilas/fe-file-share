import axios from "axios";

export const api = axios.create({
  baseURL: window.env.backend.api,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// The shared 5s default fits regular CRUD calls, but a 50MB upload/download can easily take
// longer than that on a slow connection — those calls pass this instead via the per-request
// `timeout` option rather than raising the instance-wide default (which would make genuine
// failures on lightweight requests take 10x longer to surface).
export const LARGE_FILE_TIMEOUT_MS = 60_000;
