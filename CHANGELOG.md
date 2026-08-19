# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-08-18

### Added

- Search now hits api-keep's new `GET /v1/folders/search` (indexed name + text-content search)
  instead of walking the full in-memory tree — scales to large workspaces, debounced 300ms.
- Favorites: star toggle on file/folder cards and rows, plus a dedicated "Favoritos" view in the
  sidebar (`GET /v1/folders/favorites`).
- Recientes: a "Recientes" sidebar view listing files ordered by last actual download/open
  (`GET /v1/folders/recent`), backed by the new per-file `lastAccessedAt`.
- `FolderContentsPanel` can now render an arbitrary node list (`nodes`/`title` props) instead of
  always deriving children from a folder position — powers the new Favoritos/Recientes views while
  reusing the existing grid/list rendering, multi-select and bulk actions.
- Bulk "Mover a..." action in the multi-select toolbar, fanning out to the existing move endpoint
  the same way bulk download/delete already do, with a summary toast.
- Conflict resolution on rename/move: a 400 name-collision response now offers a one-click "usar
  'X (2)'" retry with a suggested alternative name, instead of a generic error toast.
- Plain-text and Markdown preview in `FilePreviewModal` (via `react-markdown`), read-only.
- First-time onboarding tour (Ant Design `Tour`, spotlight-anchored via a shared ref registry),
  covering the file tree/upload area, search, Favoritos/Recientes, storage usage and sharing.
  Shown once automatically, backed by the existing `hasSeenTour` flag / `PUT /onboarding/tour`.

## [1.3.0] - 2026-08-18

### Added

- Workspace storage usage indicator in the folder tree sidebar (progress bar + "used / quota"
  label), backed by api-keep's new `GET /v1/folders/usage` endpoint. Refreshes on upload, delete,
  and live WebSocket tree events.
- Empty state for folders with no content: an Ant Design `Empty` placeholder with a hint to drag
  files in or use the upload button, replacing the previous blank panel.

## [1.2.0] - Baseline

Snapshot of the feature set prior to this changelog's introduction — see README for full detail.

### Added

- File browser: grid view + collapsible tree sidebar, breadcrumbs, right-click context menu.
- Upload via drag-and-drop, sidebar button, or mobile tap-to-upload, with a concurrency-limited
  upload queue.
- Move via drag-and-drop between folders (grid or tree).
- Multi-select with bulk download (zipped) and bulk delete.
- Client-side tree search.
- Sharing a file/folder with another app in the suite.
- Real-time sync of the file tree over WebSocket when another session changes something.
- Multi-workspace switching, persisted as a per-user setting.
- Guided onboarding wizard with a first-upload step.
- Keycloak login (realm `m2`) with automatic token refresh.
- Light/dark theming, responsive layout with a mobile drawer nav.

[1.4.0]: https://github.com/matiasferrerovilas/fe-file-share/releases/tag/v1.4.0
[1.3.0]: https://github.com/matiasferrerovilas/fe-file-share/releases/tag/v1.3.0
[1.2.0]: https://github.com/matiasferrerovilas/fe-file-share/releases/tag/v1.2.0
