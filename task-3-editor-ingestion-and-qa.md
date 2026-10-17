# Task 3 — Built-In Text Editor, Ingestion & Release QA

**Project:** EPCmind AI Workbench
**Spec phases covered:** Phase 4 (Add the text-document editor) + Phase 5 (Connect editor to ingestion) + Phase 6 (QA & deployment)
**Depends on:** Task 1 (shell, API client, notifications, shortcuts) and Task 2 (Documents vault, Ask Documents)

---

## 1. Goal

**This is the most important new capability.** Let engineers create their own text documents inside EPCmind, write technical notes, save drafts, and ingest them into the **existing** knowledge base.

Example content: engineering observations, inspection findings, vendor meeting notes, site observations, technical clarifications, manually recorded specification requirements, internal procedures.

**The editor is a frontend feature.** It creates `.md`/`.txt` files and submits them through the existing upload endpoint. No new embedding model, vector DB, retrieval endpoint or ingestion endpoint.

### User journey

```text
Create Text Document
        |
Enter document title
        |
Write / edit content
        |
Save draft
        |
Review and confirm content
        |
Ingest into Knowledge Base
        |
Existing ingestion endpoint
        |
Existing parsing and chunking
        |
Existing embedding / vector-store pipeline
        |
Document becomes searchable through Ask Documents
```

---

## 2. Part A — Editor UI (Phase 4)

### Layout reference

```text
┌──────────────────────────────────────────────────────────────┐
│ Engineering_Notes.md          Draft • Unsaved changes       │
├──────────────────────────────────────────────────────────────┤
│ File   Edit   View   Insert                  Save   Ingest   │
├──────────────────────────────────────────────────────────────┤
│  1  # Engineering Notes                                      │
│  2                                                          │
│  3  ## UPS Requirements                                     │
│  4  Required battery backup: 15 minutes at full load.       │
│  5                                                          │
│  6  ## Site Observations                                     │
│  7  Add inspection findings here...                         │
│  8                                                          │
├──────────────────────────────────────────────────────────────┤
│ Markdown | UTF-8 | 8 lines | Draft not ingested              │
└──────────────────────────────────────────────────────────────┘
```

Layout reference only — **do not build a custom code editor from scratch**.

### Required for v1
- [ ] Create a document
- [ ] Edit title and body
- [ ] Rename documents
- [ ] Save draft
- [ ] Reopen saved drafts
- [ ] Delete drafts **with confirmation**
- [ ] Display unsaved-change status
- [ ] Ingest the document
- [ ] Display ingestion progress and errors
- [ ] Open an already-created document from the explorer

### Recommended
- Markdown syntax support
- Headings and lists
- Code / technical text blocks
- Undo/redo
- Find within document
- Word and character count
- Keyboard shortcuts
- Preview mode

### Editor choice
Use a lightweight established editor (e.g. **CodeMirror**) if it fits the existing frontend stack. A plain `<textarea>` is acceptable for a proof of concept. **Don't add a heavyweight editor framework** unless benefits justify it. **Bundle all editor dependencies locally** (no CDN).

### Formats
- Start with Markdown (`.md`) and plain text (`.txt`) only.
- Default new document: `Untitled.md`, empty or with an optional starter heading.
- User chooses the final title.
- System **sanitizes the filename and validates the extension** before creating an upload.
- Don't require Word/PDF for simple notes.

### Components

```text
src/features/editor/
├── TextDocumentEditor
├── EditorToolbar
├── MarkdownPreview
├── DraftStore
└── IngestionController
```
Styles in `styles/editor`.

### Editor status bar
Format (Markdown/Text) · encoding (UTF-8) · line count · draft/ingestion state (e.g. "Draft not ingested").

### Shortcuts to activate
`Ctrl+N` create document · `Ctrl+S` save draft · `Ctrl+Shift+I` ingest · `Ctrl+F` find in document. Register only when the editor is active; don't intercept typing in unrelated inputs; don't override browser shortcuts unnecessarily. Command palette: "Create Text Document" becomes live.

### Explorer & Home integration
- [ ] "My Notes" group in the Explorer lists real drafts
- [ ] Home "Recent work" shows saved drafts
- [ ] Documents vault "New Text Document" button opens the editor

---

## 3. Part B — Draft saving & persistence

Separate **draft saving** from **knowledge-base ingestion**.

A draft is an editable document that has not necessarily been ingested. For v1, store drafts in **browser-local persistence (e.g. IndexedDB)**, provided:
- [ ] UI clearly states drafts are **local to the current browser profile**
- [ ] Unsaved changes preserved during ordinary navigation (switching modules/tabs)
- [ ] Warning before discarding unsaved edits (incl. closing tab / navigating away)
- [ ] **Failed save is visible** (persistent banner)
- [ ] Clear way to **export a draft** (`.md`/`.txt` download)
- [ ] **No secrets stored in draft data**

Browser-local storage is not a server-side repository. Shared drafts / multi-device = separate future requirement. No new DB for open tabs.

### Document states — UI must distinguish all five

| State | Meaning |
|---|---|
| **Draft** | Saved locally, not ingested |
| **Unsaved** | Changes not yet saved |
| **Ingesting** | Request in progress |
| **Ingested** | Backend confirms successful processing |
| **Failed** | Ingestion failed; user can retry |

**Never label a document "Ingested" merely because it was saved in the browser or uploaded if processing hasn't completed.** Use text labels/icons, not color alone.

---

## 4. Part C — Ingestion (Phase 5)

**Reuse the existing upload endpoint** (via `documentsApi.uploadDocument`).

1. Read current editor content.
2. Validate title and content.
3. Generate a `.md` or `.txt` file in the browser (create a `File` object from editor content).
4. Submit with the **same multipart/form-data structure** used by the existing upload feature.
5. Let the existing backend validate, parse, chunk, embed and index.
6. Use the backend's **actual response** to update the UI.
7. Refresh the existing document list and relevant dashboard metrics.

> **Before implementing:** verify the backend accepts Markdown and plain-text through the existing route (from Task 1 Part A). If it does, no backend endpoint change is needed. If not, isolate the gap and propose the **smallest compatible backend change**.

### Explicit user action + confirmation dialog
Ingestion must always be an explicit user action. Before ingesting, show:
- Document title
- Format
- Content preview
- Statement: *the document will be submitted to the configured local knowledge base*

### After success, show
- Processing result
- Document identifier — if returned
- Chunk count — if returned
- Any backend warning
- A link/action to open the document in the vault

### On failure
- **Retain the draft** so the user can retry without losing content.
- Show an understandable error + expandable technical diagnostic.
- Retry control (safe, since the draft is preserved).
- Success shown **only** after backend confirmation.

### Guards
- [ ] Prevent duplicate/double ingestion submissions
- [ ] Use existing backend validation and file-size limits
- [ ] Sanitize filenames before upload
- [ ] Handle interrupted ingestion (state recovers; draft intact)

### Duplicate & update behavior
Avoid silently re-ingesting the same content. Before ingestion, compare against known document metadata where possible. If a same-name document exists, offer:
- **Ingest as a new document** with a distinct filename, or
- **Cancel** and return to editing.

Do **not** assume the backend supports overwrite or deleting old vectors. No automatic in-place sync between drafts and indexed docs unless the backend already supports versioning and safe re-indexing.

If the user edits a document **after** ingestion: show that the draft **differs from the indexed version** and require an explicit **re-ingestion** action.

---

## 5. Part D — QA & deployment (Phase 6)

### Test checklist
- [ ] All existing routes
- [ ] Editor draft lifecycle (create → edit → save → reopen → rename → export → delete)
- [ ] Upload failures and retries
- [ ] Long documents
- [ ] Keyboard navigation and shortcuts
- [ ] Backend offline behavior (no crash; clear banner)
- [ ] Production assets need no external network access
- [ ] 1366 × 768 and 1920 × 1080 screens
- [ ] Smaller screens: collapsible explorer, bottom panel drawer, no essential control lost

### Acceptance tests

**Test B — Create and ingest a text document**
1. Create `UPS_Inspection_Notes.md`.
2. Enter a heading and several paragraphs.
3. Save the draft.
4. Navigate to another module and return.
5. Verify the draft remains available in the same browser profile.
6. Ingest the document.
7. Verify successful backend processing.
8. Query the knowledge base for a phrase contained in the note.
9. Confirm the response is grounded in the ingested document.

**Test C — Failed ingestion**
1. Create a draft.
2. Trigger an upload failure or temporarily make the backend unavailable.
3. Verify the editor retains the content.
4. Display an understandable error.
5. Retry after connectivity is restored.
6. Verify success is shown only after confirmation.

**Test E — Air-gapped operation**
1. Load the deployed frontend in the supported local environment.
2. Disable external network connectivity.
3. Verify local assets load.
4. Verify supported local APIs and inference paths remain functional.
5. Confirm no document content is transmitted to external services.

**Also re-run** Test A (existing PDF ingestion) and Test D (compliance workflow) as a final regression.

### Air-gap & security checklist
- [ ] No external telemetry or analytics
- [ ] No external font downloads at runtime; no mandatory CDN
- [ ] No remote AI calls hidden behind a local-looking interface
- [ ] No document content sent to external services by the editor
- [ ] No secrets in browser-local draft data
- [ ] Existing backend validation and file-size limits used
- [ ] Filenames sanitized before upload
- [ ] CORS unchanged unless a verified issue needs a targeted fix
- [ ] No service worker / offline-sync layer
- [ ] Editor and fonts bundled locally in the production build

### Performance
- Preserve editor contents during navigation
- Don't reload the whole app on tab switch
- Prevent duplicate upload/ingestion submissions
- Load large document contents only on request

---

## 6. Out of scope (future enhancements, only if not already supported by backend)
Server-side document management · shared drafts across users/devices · document versioning · safe replacement of previously indexed content.

---

## 7. Definition of Done — Task 3 (and the full redesign)
- [ ] Users can create and edit Markdown/plain-text documents
- [ ] Drafts survive ordinary navigation and can be exported
- [ ] Unsaved-change protection works
- [ ] Users explicitly ingest into the **existing** knowledge base after a preview/confirmation
- [ ] Ingestion status reflects **real backend results**; drafts retained on failure
- [ ] UI clearly distinguishes saved drafts from indexed documents (Draft / Unsaved / Ingesting / Ingested / Failed)
- [ ] Duplicate filenames handled; post-ingestion edits require explicit re-ingestion
- [ ] A created note becomes queryable through Ask Documents
- [ ] Tests A–E pass; air-gapped operation verified
- [ ] No backend rewrite required; existing functionality passes regression testing
