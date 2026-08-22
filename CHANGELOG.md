# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Custom color/icon per folder, via a new "Personalizar" context-menu item (folder rows/cards
  only) opening `FolderCustomizeModal` — a fixed palette of 8 colors and a fixed set of 10 icons
  (closed sets, not user-extensible; the backend doesn't validate them either, so an unrecognized
  stored value just falls back to the default `FolderOutlined`/no tint). Applied to the folder's
  cover icon and its type `Tag` in both grid (`FolderContentCard`) and list (`FolderContentRow`)
  views. New `useSetFolderCustomization` hook, `setFolderCustomization` API call
  (`PATCH folders/{id}/customization`), `folderColor`/`folderIcon` on `FileSystemNodeMetadata`.

### Changed
- Every protected route now requires `ADMIN` or `FAMILY` — `GUEST` dropped from all 7 routes'
  `protectedRouteGuard` role lists (previously all three roles were allowed everywhere). Matches the
  same gate just added on api-keep's `SecurityConfiguration`, and fe-movements no longer showing the
  Keep link to a `GUEST` user.
- `protectedRouteGuard`'s default redirect on a failed role check changed from `/` to a new `/403`
  route (`Forbidden`, the same component already used for a Keycloak auth failure) — landing back on
  `/` for a role you don't have just looked like nothing happened; now it's an actual explanation.

### Added
- Revoking a share now has UI: today's `DELETE /v1/shares/{id}` backend endpoint had zero callers
  in the frontend — `sharesApi.ts` only exported `shareFile`/`getShares`, and `getShares` itself was
  never imported anywhere. New `revokeShare` API function + `useRevokeShare` hook (resolves the
  share id by re-fetching the file's shares and matching on `apiName`, since revoke is by id but the
  UI only knows file + target app). The existing "Compartir con" context-menu submenu now shows
  "Dejar de compartir con X" for a target the file is already shared with (via `node.shareWith`,
  already on the tree — no extra fetch needed to know current state), toggling share/unshare on
  click. Both `useShareFile` and `useRevokeShare` invalidate the file tree on success so the menu
  reflects the new state immediately.
- Help Center gained sections for Favoritos, Recientes, and Papelera — previously these three
  features only existed as UI labels, with zero explanation anywhere (`helpContent.ts` only covered
  workspace/navigation/upload/organize/selection/share).
- Onboarding tour gained 3 steps it was missing: the grid/list view toggle (with sort), the Papelera
  sidebar button (new ref registered for it), and a closing step pointing to the Help Center — none
  of these existed when the tour was first built, plus "Papelera" itself didn't exist yet at the time.

### Changed
- Bulk delete/move/download (`FolderContentsPanel`) and trash restore (`TrashContentsPanel`) now
  report *which* items failed, not just a count — switched from a `message.error("N de M fallaron")`
  toast to `notification.error` with a description listing the failed items' names (new
  `describeBulkFailures` util, reused across all four operations).
- A failed upload now shows a specific reason next to the file in the progress tray instead of
  being unexplained — name collision and checksum-duplicate (409, "el contenido ya existe como 'X'")
  each get their own message (new `parseChecksumConflict` in `conflictResolution.ts`, the upload
  counterpart to the existing `parseNameConflict`); anything else falls back to a generic per-item
  message. Previously only the aggregate "N of M subidas fallaron" toast existed — true for every
  failure reason alike, checksum duplicates included, and without saying which file.

### Tests
- Added coverage for four of the newest, previously-untested pieces: `useFileSearch` (debounce
  timing, trimming, workspace-gating), `MoveToFolderModal` (folder-only tree, selection, root as a
  valid target), `AppTour` (step order and content, finish/close both mark the tour seen), and
  `UploadQueueProvider`'s error paths (per-item error status/message, partial-batch failure count,
  pre-upload rejection for oversized/media files, TTL-based removal from the queue).
- Workspace member invitations, mirroring fe-movements — previously nonexistent in fe-keep despite
  api-identity supporting them: no button, no screen, so "sharing a workspace" only existed on the
  backend. New `/settings` page (wires up the "Ajustes" nav item, previously a dead end that just
  closed the profile popover) with an "Invitaciones Pendientes" panel and a workspace panel showing
  members, an invite-member modal, remove-member (OWNER only), and leave-workspace. Live updates via
  two new hooks, `useInvitationSubscription`/`useWorkspacesSubscription`, subscribing to the new
  STOMP topics api-keep now pushes to. `Workspace`/`WorkspaceMetadata` gained `memberDetails`
  (userId/email/role per member). Cleaned up `websocket/EventWrapper.ts` in the process — it was an
  unused copy-paste leftover from fe-movements, still carrying `MOVEMENT_ADDED`/`SERVICE_PAID`/
  `INVESTMENT_UPDATED` event types that mean nothing here and a fictional `ACCOUNT_LEFT` value
  nothing ever published (the exact same dead-topic bug found and fixed in fe-movements this same
  session) — now scoped to just the three event types api-keep's backend actually emits.

### Changed
- Explained *why* photo/video uploads get rejected instead of just rejecting them, across all three
  places a new user hits this: the upload-rejection toast (`files.uploadRejectedMedia`, shown by
  both the main upload flow and the onboarding welcome step, since both share
  `getUploadRejectionReason`), the onboarding welcome step (new third intro line), and the Help
  Center's "Subir archivos" section (new dedicated tip). All three now say the same thing: Keep is
  for important documents (PDFs, contracts, notes) you don't want to lose, not a photo library —
  photos/videos are Immich's job, a separate app in the suite. Previously this was never stated
  anywhere, so the rejection read as a broken/arbitrary limitation instead of a deliberate scope
  decision.

### Added
- New onboarding intro screen (`IntroOnboarding`): a first, form-free step before the workspace/upload
  wizard that states the app's value proposition (real organization, content search, trash with a
  safety net, instant sync, connected to the rest of the suite) with a single "Empezar" CTA. Mirrors
  the same addition in fe-movements/movements-mobile.

### Fixed
- Desktop `NavHeader`: the logo was a plain `<img>` with no click handler, so there was no way to
  get back to the home screen from a deeper page without using the browser's back button. Now
  wrapped in a button that navigates to `/` (matching the mobile header, which already had this).

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
