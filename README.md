# fe-keep

Web frontend for [api-keep](https://github.com/matiasferrerovilas/api-file-share) — a file browser and uploader for the `keep` file storage service. Built with React 19, TypeScript, and Vite.

## Features

- **File browser**: grid view + collapsible tree sidebar, breadcrumbs, right-click context menu
- **Upload**: drag-and-drop (anywhere on the page), sidebar button, and mobile tap-to-upload, with a concurrency-limited upload queue
- **Move**: drag-and-drop between folders in the grid or tree
- **Multi-select**: bulk download (zipped) and bulk delete
- **Search**: client-side tree search
- **Sharing**: share a file/folder with another app in the suite
- **Real-time sync**: the file tree updates live when another session uploads, renames, moves, or deletes something, over the WebSocket connection api-keep pushes to
- **Multi-workspace**: switch between workspaces, persisted as a per-user setting
- **Onboarding**: guided first-run wizard with a first-upload step
- **Auth**: Keycloak login (realm `m2`), automatic token refresh
- **Theming**: light/dark mode, responsive layout with a mobile drawer nav

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for dev server and build
- **TanStack Router** (file-based routing) + **TanStack Query** for data fetching/caching
- **Ant Design 6** for UI components
- **Axios** with an auth interceptor for token refresh/401 retry
- **@stomp/stompjs** + **sockjs-client** for real-time updates
- **Vitest** + Testing Library for tests

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- A running [api-keep](https://github.com/matiasferrerovilas/api-file-share) instance
- Access to the `m2` Keycloak realm, with an `fe-keep` public client

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/matiasferrerovilas/fe-file-share.git fe-keep
   cd fe-keep
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure the backend/auth endpoints**
   Runtime config is injected via `window.env`, not `.env` files — edit `config/config.local.js`:
   ```js
   window.env = {
     environment: "local",
     keycloak: { clientId: "fe-keep", realm: "m2", url: "https://auth.eva-core.com" },
     backend: {
       api: "http://localhost:8081/v1",
       websocketUrl: "http://localhost:8081",
     },
   };
   ```

4. **Run the dev server**
   ```bash
   pnpm dev
   ```

For a production-config preview, use `pnpm dev:prod` (loads `config/config.prod.js`).

### Build

```bash
pnpm build
```

Builds a static bundle to `dist/`, served by nginx in the provided `Dockerfile`. `pnpm build` always bakes `config/config.prod.js` into the output `config.js` regardless of mode (see the `envConfig` Vite plugin) — there's no runtime environment switch, so a different backend/Keycloak target means editing `config/config.prod.js` and rebuilding.

## Testing

```bash
pnpm test           # watch mode
pnpm test:coverage  # with coverage
```

## Linting

```bash
pnpm lint
```

