# ERP Implementation (v2)

A custom Frappe app for end-to-end ERP implementation project management —
built entirely on standard Frappe/ERPNext DocTypes plus this app's own
implementation-stage DocTypes. No separate front-end; every stage surfaces
as a **Connections tab inside the Project record itself**.

## Locked v2 scope

**9 lifecycle tabs**

| # | Tab | DocType(s) |
|---|-----|-----------|
| 1 | Requirements | `Requirement` (parent) + `Requirement Item` (child table) |
| 2 | Fit-Gap | `Fit Gap Analysis` (auto-created per Requirement Item row) |
| 3 | Config/Dev | `Configuration Register`, `Development Register` |
| 4 | Data Migration | `Data Migration` |
| 5 | Test/UAT | `Test Case`, `Defect`, `UAT` |
| 6 | Go-live | `Go Live Checklist` |
| 7 | Onsite Visits | `Onsite Visit` (+ child tables `Onsite Visit Timesheet`, `Onsite Visit Expense`) |
| 8 | Costing | **Native fields** (estimated/actual costing, expense claim, billable/billed amount) shown in a dedicated Costing tab, alongside linked Sales Order / Sales Invoice records. No new DocType — just a tab surfacing native data. |
| 9 | RAID | `RAID Log` |

**+2 governance additions (live directly on Project)**

| Addition | Type |
|----------|------|
| Steering Committee | Child table (`Steering Committee Member`: Member Name, Role, Organization) — added as a Table custom field on Project |
| Status Update Log | Standalone DocType (`Status Update Log`: Date, Update Summary, Shared With), linked to Project |

## Automation

`Fit Gap Analysis.on_update()` (see
`erp_implementation/erp_implementation/doctype/fit_gap_analysis/fit_gap_analysis.py`):

- On status → **Approved**, auto-creates either a `Configuration Register`
  (Fit/Configuration gap type) or a `Development Register` (Development gap
  type) record.
- Auto-creates a `Task` linked to the Project and to that register.
- **Task assignment always stays manual** — this was explicitly locked as a
  non-automated step regardless of gap type.

## How the tabs show up on Project

Two layers, both included:

1. **Literal per-stage tabs** — the actual mechanism behind every tab you'll see day to day. All 11 tabs (Requirements, Fit-Gap, Config/Dev, Data Migration, Test/UAT, Go-Live, Onsite Visits, RAID, Costing, Tasks, Timesheets) are each a **Tab Break + HTML** Custom Field on Project (see `fixtures/custom_field.json`, 26 fields total). `public/js/project.js` (wired via `hooks.py`'s `doctype_js`) fills each HTML field with a live embedded list — clickable rows, a "+ New" button — every time the form refreshes. Costing, Tasks, and Timesheets pull from native ERPNext data (Project's own costing fields, Task, Sales Order/Invoice, Timesheet) but are surfaced as their own tabs here rather than left under the default Connections tiles. Timesheet's `project` field lives on its child table (Timesheet Detail), so that one tab calls a small whitelisted method in `api.py` instead of the generic list fetch.
2. **Native Connections tab** — `hooks.py`'s `override_doctype_dashboards` (see `project_dashboard.py`) additionally groups every implementation doctype under Frappe's built-in Connections tab, as a fallback summary view.

## Deferred / out of scope for v2

- **Task Templates** — deferred to v2.1.
- **Workflow/Report/Dashboard/Integration Registers, RACI** — skipped for v1
  and not reintroduced in v2.
- Native ERPNext Data Import/Export is already available on every DocType
  here with no additional build needed.

## Installing on Frappe Cloud / bench

```bash
# from your bench directory
bench get-app erp_implementation /path/to/this/unzipped/erp_implementation
bench --site your-site.com install-app erp_implementation
bench --site your-site.com migrate
```

If deploying via Frappe Cloud (as with the `helpbot` app): push this folder
to a GitHub repo, then add it as a custom app on your Frappe Cloud bench and
deploy.

## Repo layout

```
erp_implementation/
├── erp_implementation/                # app root (Python package)
│   ├── hooks.py
│   ├── modules.txt
│   ├── config/
│   │   └── desktop.py
│   └── erp_implementation/            # module folder
│       ├── project_dashboard.py
│       ├── fixtures/
│       │   └── custom_field.json
│       └── doctype/
│           ├── requirement/
│           ├── requirement_item/
│           ├── fit_gap_analysis/
│           ├── configuration_register/
│           ├── development_register/
│           ├── data_migration/
│           ├── test_case/
│           ├── defect/
│           ├── uat/
│           ├── go_live_checklist/
│           ├── onsite_visit/
│           ├── onsite_visit_timesheet/
│           ├── onsite_visit_expense/
│           ├── raid_log/
│           ├── steering_committee_member/
│           └── status_update_log/
├── pyproject.toml
├── setup.py
├── requirements.txt
├── license.txt
└── README.md
```

## Note on field defaults

Every DocType JSON here is a working, valid Frappe DocType definition with a
sensible baseline field set matching what was locked in scope discussions.
Treat field lists as a first pass — add/rename fields freely via the GitHub
web editor or Customize Form, the same workflow already used for v1.
