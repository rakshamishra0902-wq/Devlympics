# Task 1 — Foundation, API Client & Application Shell

**Project:** EPCmind AI Workbench
**Spec phases covered:** Phase 1 (Inspect & stabilize) + Phase 2 (Build the new application shell)
**Depends on:** nothing — do this first
**Unlocks:** Task 2 (module redesign), Task 3 (editor + ingestion)

---

## 1. Goal

Replace the current sidebar-plus-floating-pill-navbar layout with one persistent, VS Code-inspired, dark, desktop-first shell. Document the existing backend contracts and wrap them in a centralized API client. No backend changes.

**Principle:** Build a new frontend shell, not a new EPCmind backend.

### Design principles
1. **One persistent workspace** — navigation, document context and project info stay accessible as the user changes tasks.
2. **Documents are the center** — upload, inspect, create, edit and ingest from the same environment.
3. **Evidence before answers** — AI responses and compliance findings keep their link to source documents.

### Global constraints (apply to all three tasks)
- Preserve the existing FastAPI backend and AI pipeline.
- Air-gapped, on-premises compatible.
- No unnecessary databases, services, dependencies or API migrations.
- Usable at 1366 × 768 and 1920 × 1080.

---

## 2. Part A — Inspect & baseline (Phase 1)

Do this before writing any UI.

- [ ] Map all current routes (e.g. `/ask`, upload page, compliance, correspondence, home).
- [ ] Identify the existing API client (or lack of one) and every endpoint's path, request fields and response shape.
- [ ] Record the current ingestion workflow end to end (upload → validate → parse → chunk → embed → index).
- [ ] **Confirm the backend accepts `.md` and `.txt` through the existing upload route** (needed by Task 3). Record allowed extensions and file-size limits.
- [ ] Identify the existing state-management approach.
- [ ] Capture a baseline of current functionality so regressions can be detected.
- [ ] Note which of these exist in the backend (affects Task 2/3 UI): folder metadata, document list with status/chunk count/dates, audit history, export, overwrite/delete of indexed docs, stop/cancel for chat.

**Deliverable:** a short `docs/api-contracts.md` (paths, request/response formats, gaps) plus a baseline checklist of working flows.

**Acceptance:** existing workflows are documented and can be tested before redesign.

---

## 3. Part B — Centralized API client

Wrap actual backend routes in a small set of reusable functions. No scattered `fetch` calls in components. Names below are conceptual — use the real paths and fields found in Part A.

```text
src/services/
├── apiClient        # base request wrapper, error normalization, timeouts
├── documentsApi     # uploadDocument(file), fetchDocuments()
├── askApi           # askKnowledgeBase(question, options)
├── complianceApi    # runComplianceAudit(documentIds)
└── emailsApi        # fetchEmails(), syncEmails()
```

- [ ] Single base client with consistent error shape (status, human message, expandable technical detail).
- [ ] Distinguish backend unavailable vs validation rejection vs processing failure.
- [ ] Never log document content, API keys or credentials.
- [ ] Prevent duplicate upload submissions (in-flight guard).
- [ ] If a needed capability is missing from the API, isolate the gap and propose the **smallest compatible backend change** — do not rewrite architecture.

**Do not add:** a second vector DB, a separate RAG pipeline, a new text-ingestion endpoint (if upload already accepts `.md/.txt`), cloud dependencies, new auth, new DB for tabs, remote LLM dependency.

---

## 4. Part C — Visual design system

Restrained industrial-technical look: VS Code / developer tools / engineering software. Dense but readable. Avoid oversized rounded cards, big hero sections, heavy gradients, bright purple. Square or mildly rounded surfaces, 1px dividers, compact controls.

### Color tokens

| Token | Color | Purpose |
|---|---|---|
| Application background | `#111315` | Main window |
| Activity bar | `#17191C` | Icon navigation |
| Sidebar background | `#1B1E22` | Explorer and secondary navigation |
| Editor background | `#111315` | Documents and content |
| Panel background | `#191C20` | Chat and audit panels |
| Primary border | `#2B3036` | Dividers and outlines |
| Primary text | `#E4E7EB` | Headings and content |
| Secondary text | `#969EA8` | Descriptions and metadata |
| Accent cyan | `#38BDF8` | Active navigation and links |
| Success green | `#4ADE80` | Successful ingestion and compliance |
| Warning amber | `#FBBF24` | Unresolved / review-required |
| Error red | `#F87171` | Failures and critical deviations |

Color must communicate meaning, not decoration. Status must also use text labels or icons, never color alone.

### Typography
- UI: Inter or the app's existing sans-serif.
- Editor: JetBrains Mono or comparable monospace.
- Base UI 13–14 px · Main headings 20–24 px · Editor 14–15 px · Status bar 11–12 px.

### Implementation
- [ ] `styles/tokens` — CSS variables for all tokens above.
- [ ] `styles/layout`, `styles/components` as needed (editor styles come in Task 3).
- [ ] **Bundle fonts locally** — no runtime external font downloads, no CDN.

---

## 5. Part D — Application shell

### Layout

```text
┌──────────────────────────────────────────────────────────────────┐
│ EPCmind  | Project / Workspace     Search       GPU / Node State │
├────┬──────────────┬───────────────────────────────────────────────┤
│    │              │                                               │
│ A  │ Explorer /   │  Workspace Tabs                               │
│ C  │ Navigation   ├───────────────────────────────────────────────┤
│ T  │              │                                               │
│ I  │ Project      │                                               │
│ V  │ Documents    │  Main Workspace                               │
│ I  │              │  Editor / Chat / Compliance / Email            │
│ T  │ Notes        │                                               │
│ Y  │              │                                               │
│    │              ├───────────────────────────────────────────────┤
│ B  │              │ Problems / Output / Ingestion / Audit Results │
│ A  │              │                                               │
│ R  │              ├───────────────────────────────────────────────┤
│    │              │ Local Node | Index Status | Encoding | Ready  │
└────┴──────────────┴───────────────────────────────────────────────┘
```

Five regions: activity bar · explorer sidebar · workspace tabs · main work area · bottom panel + status bar. All independently collapsible where practical. **Do not render a separate navigation shell per route** — one shell, modules swap inside it.

### D1. Title bar (~40–44 px)
- [ ] EPCmind logo + name
- [ ] Current workspace/project name
- [ ] Global search / command launcher
- [ ] Local inference node status
- [ ] Optional settings / workspace controls
- [ ] Looks like a desktop title bar — **remove the floating pill navbar**

### D2. Activity bar
Narrow vertical rail, tooltips, clear active state. Order:
1. Explorer
2. Search
3. Ask Documents
4. Compliance
5. Documents / Notes
6. Internal Correspondence
7. Settings

Sidebar contents change with the active module.

### D3. Explorer sidebar
Central place to manage project content. Recommended logical tree:

```text
EXPLORER
└── EPCmind Workspace
    ├── Documents
    │   ├── Specifications
    │   ├── Vendor Submittals
    │   ├── P&IDs
    │   └── Other Documents
    ├── My Notes
    │   ├── Engineering_Notes.md
    │   └── Inspection_Findings.md
    ├── Compliance
    │   └── Recent Audits
    └── Correspondence
```

- [ ] Expand/collapse sections
- [ ] Search/filter
- [ ] File-type icons
- [ ] File selection
- [ ] Context menus
- [ ] Create-document and upload actions
- [ ] Ingestion-status indicators
- [ ] Resizable width
- Groups are **UI groupings only**. If the backend has no folder metadata, use frontend filtering or keep the list flat. **Do not fabricate a hierarchy that implies backend storage that doesn't exist.**
- (The "My Notes" content is wired to real drafts in Task 3; render an empty state until then.)

### D4. Workspace tabs
Examples: `welcome`, `UPS_Specification.pdf`, `Vendor_Submittal.pdf`, `Engineering_Notes.md`, `Ask Documents`, `Compliance Audit`.

- [ ] Switch between open workspaces
- [ ] Close tabs
- [ ] Unsaved-change indicator
- [ ] Show file type
- [ ] Preserve selected document when switching modules
- [ ] Frontend-managed state only — **no server-side session/tab persistence**

### D5. Bottom panel
Tabs: Problems / Output / Ingestion / Audit Results. Shows ingestion jobs, audit output, errors. Collapsible. On small screens, opens as a drawer.

### D6. Status bar (11–12 px)
Local node · index status · encoding · ready state. (Editor-specific items like format/line count are added in Task 3.)

### D7. Routing integration
- [ ] Integrate existing routes into the shell so **every existing module is reachable** from the activity bar.
- [ ] Switching tabs must not reload the whole app.

---

## 6. Part E — Cross-cutting infrastructure (build now, used by Tasks 2 & 3)

### Notification / error system
Replace repeated toasts with a consistent system:
- Transient notifications for short-lived successes.
- Persistent banners for errors needing intervention.
- Progress indicators for uploads, indexing, audits.
- Retry controls only where retries are safe.
- Deduplicate repeated notifications.
- Engineer-readable messages with an **expandable diagnostic panel** for technical details.
- Never show sensitive document content, API keys or credentials in errors/logs.

Required failure cases to support: backend unavailable · upload rejected · parsing/ingestion failed · insufficient evidence · compliance audit failed · email sync failed · draft save failed · ingestion interrupted · navigated away with unsaved changes.

### Shared components
`FileTree`, `FileRow`, `SearchBar` (debounced), `StatusBadge`, `EmptyState`, `ConfirmDialog`, `NotificationCenter`.

### Command palette & shortcuts (shell-level)
| Shortcut | Action |
|---|---|
| `Ctrl + Shift + P` | Open command palette |
| `Ctrl + P` | Search and open documents |
| `Ctrl + N` | Create a text document |
| `Ctrl + S` | Save the current draft |
| `Ctrl + Shift + I` | Ingest current document |
| `Ctrl + F` | Find within active document |
| `Ctrl + B` | Toggle explorer sidebar |

Palette commands: Create Text Document · Open Documents · Upload Files · Ask Knowledge Base · Run Compliance Audit · Open Correspondence · Toggle Explorer · Toggle Bottom Panel.

Rules: palette invokes existing actions/navigation — **no duplicated business logic**. Don't override common browser shortcuts unnecessarily. Shortcuts register only when appropriate and must not intercept typing in unrelated inputs. (In this task, wire the palette, navigation and toggle commands; editor commands become live in Task 3.)

### Responsive & performance
- Desktop: persistent activity bar, resizable explorer, multiple tabs, optional bottom panel.
- Smaller screens: collapsible explorer, single active workspace, bottom panel as drawer, no essential control lost without an alternative.
- Don't reload the app on tab switch; don't refetch large lists every render; debounce search; use loading states rather than blocking the whole UI.

---

## 7. Suggested file structure

Adapt to the current codebase — don't move or rewrite everything unnecessarily.

```text
src/
├── app/            AppShell, ActivityBar, Sidebar, WorkspaceTabs, BottomPanel, StatusBar
├── components/     FileTree, FileRow, SearchBar, StatusBadge, EmptyState, ConfirmDialog, NotificationCenter
├── services/       apiClient, documentsApi, askApi, complianceApi, emailsApi
├── hooks/
├── styles/         tokens, layout, components
└── routes/
```

---

## 8. Air-gap & security checklist for this task
- [ ] No external telemetry or analytics
- [ ] No runtime font downloads, no mandatory CDN
- [ ] No service worker or offline sync layer
- [ ] CORS behavior unchanged unless a verified issue needs a targeted fix
- [ ] Local inference clearly labeled in the title bar/status bar

---

## 9. Definition of Done — Task 1
- [ ] Existing routes, API contracts and ingestion workflow documented; `.md/.txt` upload support confirmed or flagged
- [ ] Centralized API client in place and used by the existing pages
- [ ] Design tokens + local fonts in place
- [ ] Title bar, activity bar, explorer, tabs, bottom panel, status bar working and collapsible
- [ ] **Every existing module accessible through the unified shell**
- [ ] Notification/error system and shared components ready
- [ ] No backend changes; existing workflows still work
