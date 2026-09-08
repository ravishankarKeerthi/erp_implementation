app_name = "erp_implementation"
app_title = "ERP Implementation"
app_publisher = "Syvasoft Business Solutions"
app_description = "End-to-end ERP implementation project management app (v2) — 9 lifecycle tabs + 2 governance additions, built on the Project doctype."
app_email = "info@syvasoft.com"
app_license = "MIT"
app_version = "2.0.0"

# Fixtures -------------------------------------------------------------
# Exports every Project/Task Custom Field this app adds: the 8 locked v2
# Tab Break + HTML fields (Requirements, Fit-Gap, Config/Dev, Data
# Migration, Test/UAT, Go-Live, Onsite Visits, RAID), the Steering
# Committee tab + child table, and the Task register-link fields.
# (Costing and Tasks/Timesheets need no custom fields — those are native
# ERPNext, already visible on Project via its standard Connections/Costing
# sections.)
fixtures = [
	{
		"doctype": "Custom Field",
		"filters": [["dt", "in", ["Project", "Task"]], ["module", "=", "Erp Implementation"]],
	},
]

# Project record UI -------------------------------------------------------
# 1. Native Frappe "Connections" tab override — a fallback/summary view
#    grouping every v2 implementation doctype, no custom front-end needed.
override_doctype_dashboards = {
	"Project": "erp_implementation.erp_implementation.project_dashboard.get_data"
}

# 2. Literal per-stage tabs on the Project form itself. Each locked v2 tab
#    (Requirements, Fit-Gap, Config/Dev, Data Migration, Test/UAT, Go-Live,
#    Onsite Visits, RAID) is a Tab Break + HTML custom field (see
#    fixtures/custom_field.json); this client script fills each HTML field
#    with a live embedded list + "+ New" button on every form refresh.
doctype_js = {"Project": "public/js/project.js"}

# Server-side automation --------------------------------------------------
# Fit Gap Analysis -> Configuration/Development Register -> Task creation
# on Approved status lives in the Fit Gap Analysis controller's on_update
# (see doctype/fit_gap_analysis/fit_gap_analysis.py). No extra doc_events
# hook is required here since it's handled in the controller.

doc_events = {}

# Standard boilerplate (safe defaults, extend as needed) ------------------
app_include_css = []
app_include_js = []
web_include_css = []
web_include_js = []

