# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.3.0]: https://github.com/matiasferrerovilas/fe-file-share/releases/tag/v1.3.0
[1.2.0]: https://github.com/matiasferrerovilas/fe-file-share/releases/tag/v1.2.0
