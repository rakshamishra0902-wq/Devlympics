# Task 2 — Redesign Existing Modules

**Project:** EPCmind AI Workbench
**Spec phases covered:** Phase 3 (Redesign existing modules)
**Depends on:** Task 1 (shell, API client, design tokens, notification system)
**Unlocks:** Task 3 (editor reuses the Documents vault, Explorer and status components)

---

## 1. Goal

Redesign every existing module inside the new shell **without changing API behavior**. Every module must keep working against the existing FastAPI backend through the centralized API client.

**Acceptance:** existing API behavior is unchanged and all core workflows continue to work.

### Rules for every module
- Use real data only. **Do not invent metrics, activity records, folders or capabilities.** If data doesn't exist, show a useful empty state.
- Standardize empty, loading, success and error states (use `EmptyState`, `StatusBadge`, `NotificationCenter` from Task 1).
- Status must use text labels or icons, not color alone.
- Never block the whole interface during loading.
- Never display sensitive content or credentials in errors.

### Module checklist (work incrementally, one at a time)
1. Home / Welcome
2. Ask Documents
3. Technical Compliance Audit
4. Documents / Document Vault
5. Internal Correspondence

---

## 2. Module 1 — Welcome / Workspace Home

Replace the large hero section and three oversized stat cards with a compact workspace overview. It should fill the available workspace, not leave a large empty page.

**Header**
- EPCmind Workbench
- Current workspace identifier
- Air-gapped node status

**Quick actions**
- Create Text Document
- Open Documents
- Ask Knowledge Base
- Run Compliance Audit
- View Correspondence

**Workspace overview**
- Documents ingested
- Knowledge-base chunks
- Compliance deviations
- Recent ingestion and audit activity — only if available from existing data

**Recent work**
Recently opened documents, saved drafts, recent audit results — only where the app already has the information. (Saved drafts appear once Task 3 lands; leave a hook for it.)

**Empty state**
> "Your engineering workspace is ready."
> "Upload a technical specification or create a document to start building your knowledge base."

Primary actions: `Create Document` · `Upload Files`.

- [ ] "Create Document" can route to a placeholder/disabled state until Task 3 delivers the editor.

---

## 3. Module 2 — Ask Documents (`/ask` → AI chat workspace)

**Layout**
- Optional document-context sidebar
- Central conversation area
- Bottom composer
- Model selector + retrieval controls in the header
- Source references alongside or beneath responses

**Header:** `Ask Documents | Grounded Retrieval | Local Inference`

**Composer**
- [ ] Multiline input
- [ ] Enter = send, Shift+Enter = newline
- [ ] Send and stop controls **where supported** by the backend
- [ ] Optional document attachment / context selection
- [ ] Clear indication of selected model

**Models**
- Keep the existing Qwen/Gemini choices **only as supported by the current implementation**.
- Make it obvious when a model uses a remote service or needs external connectivity.
- **Never label a remote inference path as air-gapped.**

**Response presentation — every answer shows**
- Answer text
- Source document names
- Page numbers / chunk references when available
- Relevant quotations/excerpts when supported
- An **explicit insufficient-evidence response** when retrieval finds no reliable support
- Selecting a source opens the document or its details where supported

**Empty state**
> "Ask a question about your engineering documents."

Suggested prompts (suggestions only, not pre-filled answers):
- What battery backup runtime does the specification require?
- Which vendor submittals contain unresolved deviations?
- Find all references to cooling capacity.

---

## 4. Module 3 — Technical Compliance Audit

Behaves like a technical comparison workbench.

**Top toolbar**
- `Compliance Audit` title
- Select documents
- Run Audit
- Audit history — if supported
- Export results — **only if** an existing or newly approved export implementation is available

**Document selection**
- Compact selection table or file picker (no large card)
- Must allow selecting **at least two** documents
- Typical types: engineering specification, vendor submittal, equipment data sheet, procurement schedule

**Results table**

| Requirement | Specification | Vendor value | Result |
|---|---|---|---|
| Battery runtime | 15 minutes | 10 minutes | Deviation |
| Rated capacity | Required value | Submitted value | Match / Deviation |
| Cooling requirement | Required value | Missing | Cannot Verify |

> Illustration only. **Actual values and classifications must come from the real audit result.**

- [ ] Each finding exposes its source evidence and severity when available
- [ ] Filter bar: **All · Critical · Deviation · Match · Cannot Verify**
- [ ] Results show text labels/icons for status, not color alone
- [ ] Bottom panel shows audit execution logs, processing status and errors without leaving the results view
- [ ] Table scrolls horizontally on small screens
- [ ] Audit failure → persistent error banner with diagnostics (and Retry where safe)

---

## 5. Module 4 — Documents / Document Vault

The current upload page becomes a complete document-management workspace.

**Toolbar**
- New Text Document (opens editor — fully functional after Task 3)
- Upload Files
- Search (debounced)
- Filter by type
- Filter by ingestion status

**Main view — dense table or explorer list**
- File name
- Type
- File size
- Upload/creation date — when available
- Ingestion status
- Chunk count — when available
- Available actions

**Workflow (reuse existing — do not add a second ingestion implementation)**
1. User uploads a file.
2. Frontend calls the existing upload/ingestion API (via `documentsApi.uploadDocument`).
3. Backend validates and processes the file.
4. UI shows **processing / success / failure**.
5. Successful documents become available to existing knowledge-base retrieval.

- [ ] Prevent duplicate upload submissions
- [ ] Show upload rejection reasons (validation) clearly
- [ ] Show progress during upload/indexing; success only on backend confirmation
- [ ] Don't refetch the full list on every render
- [ ] Don't load large document contents until requested

---

## 6. Module 5 — Internal Correspondence

Keep it integrated in the same workspace.

**Layout**
- Left: message list
- Main: selected email + attachments
- Optional side panel: ingestion status + related knowledge-base sources

**Features**
- [ ] Sync/fetch using the existing integration
- [ ] Search messages — if supported
- [ ] View sender, subject, date, body
- [ ] Inspect attachments
- [ ] Select messages/attachments for ingestion
- [ ] Show ingestion status and errors

**Error handling**
- Replace repeated "Failed to load emails" toasts with **one persistent error banner** containing a **Retry** button and a useful diagnostic message.

**Rule:** Do **not** auto-ingest all emails if the current product requires explicit selection.

---

## 7. Regression checklist (must still work after this task)
- [ ] Uploading existing supported documents
- [ ] Querying the knowledge base
- [ ] Receiving grounded responses
- [ ] Running a compliance audit on selected documents
- [ ] Viewing and ingesting correspondence
- [ ] Failures reported without crashing the app

### Acceptance tests relevant to this task

**Test A — Existing PDF ingestion**
1. Upload a PDF.
2. Verify the existing backend receives it.
3. Verify the UI reports the actual processing result.
4. Ask a question about the document.
5. Confirm the response uses the existing retrieval pipeline.

**Test D — Compliance workflow**
1. Select two supported documents.
2. Run the existing audit.
3. Verify the backend response is displayed accurately.
4. Inspect source evidence and deviation statuses.
5. Confirm the new shell does not interfere with the audit workflow.

---

## 8. Definition of Done — Task 2
- [ ] All five modules redesigned inside the shell, using real data only
- [ ] Standardized empty / loading / success / error states everywhere
- [ ] Persistent error banner replaces repeated email toasts
- [ ] Remote vs local inference clearly distinguished in Ask Documents
- [ ] Insufficient-evidence response implemented
- [ ] Document vault shows real ingestion status, with filters and search
- [ ] Tests A and D pass; regression checklist passes
- [ ] No backend changes
