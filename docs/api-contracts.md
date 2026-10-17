# AEGIS AI — API Contracts & Baseline Analysis
**System:** AEGIS AI (Autonomous Engineering Governance and Intelligence System)  
**Spec Reference:** Task 1 Part A (Phase 1 Baseline & API Contracts)  
**Date:** 2026-10-17  

---

## 1. Overview & System Purpose

AEGIS AI is an air-gapped, on-premises autonomous engineering governance and intelligence workbench for mission-critical engineering, data centre EPC delivery, compliance verification, and site correspondence management.

This document records the exact backend API contracts, request/response formats, ingestion pipelines, file validation limits, state management baselines, and architectural gaps prior to UI modernization.

---

## 2. API Endpoint Inventory & Contracts

All endpoints run on FastAPI at base URL `http://localhost:8000` (configurable via `VITE_API_BASE`). Direct `fetch`/`axios` calls in UI components are replaced by the centralized API client in `src/services/`.

### 2.1 Health & System
| Method | Path | Request Body / Params | Response Shape | Notes |
|---|---|---|---|---|
| `GET` | `/` | None | `{"status": "ok"}` | Service heartbeat |
| `GET` | `/stats` | None | `{"total_documents": int, "total_chunks": int, "deviations_found": int}` | Dashboard high-level metrics |
| `GET` | `/audit-log` | `limit: int = 50` (query) | `{"logs": [{"time": str, "action": str, "details": dict}]}` | Audit trail from `audit_log.jsonl` |

### 2.2 Documents & Knowledge Base
| Method | Path | Request Body / Params | Response Shape | Notes |
|---|---|---|---|---|
| `GET` | `/documents` | None | `{"documents": [{"document_id": str, "filename": str, "stored_filename": str, "document_type": str, "filetype": str, "chunk_count": int}]}` | Groups indexed chunks by `document_id` |
| `GET` | `/documents/{document_id}/content` | Path `document_id` | `{"text": str}` | Concatenated text of all document chunks |
| `GET` | `/documents/{document_id}/file` | Path `document_id` | Binary stream (`FileResponse`) with `Content-Disposition: inline` | Serves original uploaded file |
| `POST` | `/upload` | Multipart form `file: UploadFile` | `{"filename": str, "document_id": str, "document_type": str, "chunks_added": int, "status": "success"}` | Subprocess sandboxed ingestion into ChromaDB |
| `DELETE` | `/documents/{document_id}` | Path `document_id` | `{"status": "success", "message": "Document removed"}` | Deletes ChromaDB chunks and local file from disk |

### 2.3 Ask Documents (RAG & Agentic Q&A)
| Method | Path | Request Body / Params | Response Shape | Notes |
|---|---|---|---|---|
| `POST` | `/ask` | `{"question": str, "document_type": str \| null, "document_id": str \| null, "provider": "qwen"}` | `{"answer": str, "sources": [{"filename": str, "document_type": str, "text": str, "distance": float}]}` | Grounded RAG with strict L2 distance threshold (`MAX_DISTANCE = 1.5`) |
| `POST` | `/ask-image` | Multipart: `question: str`, `document_type: str \| null`, `image: UploadFile` | `{"answer": str}` or `{"status": "error", "message": str}` | OCR & Vision inspection |
| `POST` | `/agent/ask` | `{"message": str, "provider": "qwen"}` | `{"type": "answer", "answer": str, "sources": [...], "auto_selected_document": str \| null}` OR `{"type": "confirm_delete", "matched_documents": [...]}` | Regex & fuzzy match agent router; safe confirmation for deletions |
| `POST` | `/agent/delete-confirmed` | `{"document_ids": list[str]}` | `{"status": "success", "deleted": list[str]}` | Confirmed agentic document removal |

### 2.4 Compliance Verification
| Method | Path | Request Body / Params | Response Shape | Notes |
|---|---|---|---|---|
| `POST` | `/compliance-check` | `{"document_ids": list[str]}` | `{"results": [{"requirement": str, "specified_value": str, "submitted_value": str, "status": "Match" \| "Deviation" \| "Cannot verify", "severity": "Critical" \| "Moderate" \| "Low" \| null}], "ran_at": str}` | Compares specifications against submittals |
| `GET` | `/compliance-check` | None | `{"results": [...], "ran_at": str}` | Returns last cached compliance check |

### 2.5 Correspondence / Email Synchronization
| Method | Path | Request Body / Params | Response Shape | Notes |
|---|---|---|---|---|
| `GET` | `/emails` | None | `{"emails": [{"uid": str, "subject": str, "from": str, "date": str, "body": str, "attachments": list, "ingested": bool}]}` | Fetched email inventory |
| `POST` | `/email/sync` | None | `{"fetched": int, "errors": list}` | Triggers Gmail IMAP synchronization |
| `POST` | `/email/ingest/{uid}` | Path `uid` | `{"chunks_added": int, "errors": list}` | Ingests specific email & attachments to ChromaDB |
| `GET` | `/email/status` | None | `{"total_fetched": int, "total_ingested": int, "last_sync": str \| null}` | Email poller metrics |

---

## 3. Ingestion Workflow & Validation Limits

### End-to-End Ingestion Flow
```text
Upload (POST /upload)
  │
  ├── 1. Filename & Extension Check (ALLOWED_EXTENSIONS)
  ├── 2. File Size Check (<= 50 MB)
  ├── 3. Persist temporary file to disk (uploaded_docs/<document_id>_<filename>)
  ├── 4. Subprocess Isolation Sandbox (sandbox_check.py)
  │     ├── Magic-Byte Signature Verification (anti-spoofing)
  │     └── Zip-Bomb Inspection (< 200 MB uncompressed limit)
  ├── 5. Parser Dispatch (exctractors.py)
  │     ├── PDF: pdfplumber + Tesseract OCR fallback
  │     ├── DOCX: MarkItDown / python-docx table parser
  │     ├── TXT & MD: Direct UTF-8 stream ingestion
  │     ├── XLSX / XLS / CSV: Pandas true-header & row records
  │     ├── JPG / PNG: Grayscale OCR
  │     └── ZIP: Nested entry validation (< 20 entries, < 10 MB each)
  ├── 6. Chunker (chunker.py)
  │     ├── Unstructured: Section-aware chunking preserving [TABLE] blocks (max 1200 chars)
  │     └── Structured: Row-level key-value chunks
  ├── 7. Vector Embedding (SentenceTransformer all-MiniLM-L6-v2, 384 dimensions)
  │     └── Auto CUDA / CPU fallback (local_files_only)
  ├── 8. ChromaDB Indexing (collection: epc_documents)
  └── 9. Audit Logging (audit_log.jsonl)
```

### Confirmation of `.md` and `.txt` Support (Task 3 Prerequisite)
- **Status:** **CONFIRMED — Fully Supported.**
- `.txt` and `.md` are explicitly included in `ALLOWED_EXTENSIONS` (`main.py` line 361) and `extract_file()` (`exctractors.py` line 168).
- They have no magic-byte signature requirement in `sandbox_check.py` (bypass signature validation safely).
- **File Size Limit:** 50 MB (`MAX_FILE_SIZE = 50 * 1024 * 1024`).
- **Zip-Bomb Safety Cap:** 200 MB uncompressed.

---

## 4. Backend Capabilities & Feature Availability Matrix

| Feature | Backend Availability | Frontend Action / Constraint |
|---|---|---|
| **Folder metadata** | ❌ None | Flatten list in UI; use client-side category filters (`Specification`, `Submittal`, etc.). **Do not fabricate fake backend folders.** |
| **Document list with status** | ⚠️ Partial | Provides `document_id`, `filename`, `filetype`, `document_type`, `chunk_count`. Ingestion timestamp not in metadata. |
| **Audit history** | ✅ Yes | `GET /audit-log` and cached `ran_at` in compliance results. |
| **Export documents** | ⚠️ Partial | `GET /documents/{document_id}/file` serves original file; `GET /documents/{document_id}/content` serves raw text. |
| **Overwrite indexed docs** | ❌ No | Re-upload creates a new `document_id`. Overwrite must delete old `document_id` then upload. |
| **Delete indexed docs** | ✅ Yes | `DELETE /documents/{document_id}` fully removes chunks from ChromaDB and file from disk. |
| **Stop / Cancel Chat** | ❌ No | Backend processes to completion synchronously. UI will handle request abort via `AbortController`. |

---

## 5. State Management & Baseline Validation

- **Current State Architecture:** React 18 local component state with lifted persistent chat state (`chatMessages`, `chatDocType`) in the top-level layout component.
- **API Client:** Previously a single Axios instance in `src/api/client.js`. Needs restructuring into a modular, resilient service layer under `src/services/` with unified error normalization, in-flight upload guards, and sensitive data masking.
- **Shell Design:** Previous design used a mobile sidebar drawer and a floating navbar pill with bright purple/indigo accents. Task 1 replaces this with the industrial-technical desktop shell: Activity Bar, Resizable Explorer, Document Tabs, Main Stage, Collapsible Bottom Panel, and Status Bar.
