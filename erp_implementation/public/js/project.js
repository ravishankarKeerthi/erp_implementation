// Copyright (c) 2026, Syvasoft Business Solutions and contributors
// For license information, please see license.txt
//
// Renders a lightweight, live list (with a "+ New" button) inside each of the
// locked v2 tabs on the Project form. Each tab is a Tab Break + HTML custom
// field (see fixtures/custom_field.json); this script fills the HTML field
// with real data every time the Project form is refreshed or a child record
// changes, so it always reflects the current linked records without a page
// reload.

frappe.ui.form.on("Project", {
	refresh(frm) {
		if (frm.is_new()) return;

		render_embedded_list(frm, "requirements_html", "Requirement", {
			columns: [
				{ fieldname: "title", label: "Title" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "fitgap_html", "Fit Gap Analysis", {
			columns: [
				{ fieldname: "requirement", label: "Requirement" },
				{ fieldname: "fit_type", label: "Fit Type" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "config_dev_html", null, {
			multi: [
				{ doctype: "Configuration Register", label: "Configuration Register",
					columns: [{ fieldname: "configuration_area", label: "Area" }, { fieldname: "status", label: "Status" }] },
				{ doctype: "Development Register", label: "Development Register",
					columns: [{ fieldname: "module", label: "Module" }, { fieldname: "status", label: "Status" }] },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "data_migration_html", "Data Migration", {
			columns: [
				{ fieldname: "migration_object", label: "Object" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "test_uat_html", null, {
			multi: [
				{ doctype: "Test Case", label: "Test Case",
					columns: [{ fieldname: "test_scenario", label: "Scenario" }, { fieldname: "status", label: "Status" }] },
				{ doctype: "Defect", label: "Defect",
					columns: [{ fieldname: "defect_description", label: "Description" }, { fieldname: "status", label: "Status" }] },
				{ doctype: "UAT", label: "UAT",
					columns: [{ fieldname: "uat_scenario", label: "Scenario" }, { fieldname: "status", label: "Status" }] },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "golive_html", "Go Live Checklist", {
			columns: [
				{ fieldname: "checklist_item", label: "Item" },
				{ fieldname: "category", label: "Category" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "onsite_visits_html", "Onsite Visit", {
			columns: [
				{ fieldname: "visit_date", label: "Date" },
				{ fieldname: "consultant", label: "Consultant" },
				{ fieldname: "purpose", label: "Purpose" },
			],
			defaults: { project: frm.doc.name },
		});

		render_embedded_list(frm, "raid_html", "RAID Log", {
			columns: [
				{ fieldname: "type", label: "Type" },
				{ fieldname: "description", label: "Description" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_costing_tab(frm);

		render_embedded_list(frm, "tasks_html", "Task", {
			columns: [
				{ fieldname: "subject", label: "Subject" },
				{ fieldname: "priority", label: "Priority" },
				{ fieldname: "status", label: "Status" },
			],
			defaults: { project: frm.doc.name },
		});

		render_timesheets_tab(frm);
	},
});

const STATUS_COLORS = {
	Draft: "#8d99a3", Open: "#8d99a3", Pending: "#8d99a3", "Not Run": "#8d99a3", "Template Prepared": "#8d99a3",
	"In Review": "#a9660a", "In Progress": "#a9660a", Working: "#a9660a", "Mock Run 1": "#a9660a", "Mock Run 2": "#a9660a", Retest: "#a9660a",
	Approved: "#2e844a", Completed: "#2e844a", Pass: "#2e844a", Closed: "#2e844a", Validated: "#2e844a", Passed: "#2e844a", Fixed: "#2e844a",
	Rejected: "#c53030", Failed: "#c53030", Cancelled: "#c53030", Fail: "#c53030",
	Submitted: "#2490ef", "To Bill": "#2490ef", Deployed: "#2490ef", Paid: "#2e844a",
};

function status_pill(value) {
	if (!value) return "";
	const color = STATUS_COLORS[value] || "#8d99a3";
	return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:${color};">
		<span style="width:6px;height:6px;border-radius:50%;background:${color};"></span>${frappe.utils.escape_html(value)}</span>`;
}

function render_embedded_list(frm, html_fieldname, doctype, opts) {
	const field = frm.get_field(html_fieldname);
	if (!field) {
		console.warn(`[project.js] Field "${html_fieldname}" not found on this form — skipping this tab's render.`);
		return;
	}
	const wrapper = field.$wrapper;
	wrapper.empty();

	if (opts.multi) {
		opts.multi.forEach((section) => {
			const $section = $(`<div style="margin-bottom:18px;"></div>`).appendTo(wrapper);
			$(`<div style="font-weight:600;font-size:12px;text-transform:uppercase;
				color:#8d99a3;margin-bottom:6px;">${section.label}</div>`).appendTo($section);
			fetch_and_render($section, section.doctype, section.columns, opts.defaults);
		});
		return;
	}

	fetch_and_render(wrapper, doctype, opts.columns, opts.defaults, true);
}

function fetch_and_render($container, doctype, columns, defaults, show_new_button) {
	const fields = ["name"].concat(columns.map((c) => c.fieldname));
	frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: doctype,
			filters: defaults,
			fields: fields,
			limit_page_length: 20,
			order_by: "modified desc",
		},
		callback: function (r) {
			const rows = r.message || [];
			const $table = $(`
				<table class="table table-bordered" style="margin-bottom:6px;">
					<thead><tr>
						<th>ID</th>
						${columns.map((c) => `<th>${frappe.utils.escape_html(c.label)}</th>`).join("")}
					</tr></thead>
					<tbody></tbody>
				</table>
			`);
			const $tbody = $table.find("tbody");

			if (!rows.length) {
				$tbody.append(
					`<tr><td colspan="${columns.length + 1}" class="text-muted">No records yet</td></tr>`
				);
			}

			rows.forEach((row) => {
				const $tr = $(`<tr style="cursor:pointer;"></tr>`)
					.on("click", () => frappe.set_route("Form", doctype, row.name))
					.appendTo($tbody);
				$tr.append(`<td><a>${frappe.utils.escape_html(row.name)}</a></td>`);
				columns.forEach((c) => {
					const val = row[c.fieldname];
					$tr.append(`<td>${c.fieldname === "status" ? status_pill(val) : frappe.utils.escape_html(val || "")}</td>`);
				});
			});

			$container.append($table);

			const $btn = $(`<button class="btn btn-xs btn-default">+ New ${doctype}</button>`);
			$btn.on("click", () => {
				frappe.new_doc(doctype, defaults);
			});
			$container.append($btn);
		},
	});
}

function money(v) {
	return format_currency(v || 0, frappe.defaults.get_default("currency"));
}

function render_costing_tab(frm) {
	const field = frm.get_field("costing_html");
	if (!field) {
		console.warn('[project.js] Field "costing_html" not found on this form — skipping Costing tab render.');
		return;
	}
	const wrapper = field.$wrapper;
	wrapper.empty();

	const $fields = $(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:0 30px;margin-bottom:18px;"></div>`);
	const rows = [
		["Estimated Costing", money(frm.doc.estimated_costing)],
		["Total Costing (Actual)", money(frm.doc.total_costing_amount)],
		["Total Expense Claim", money(frm.doc.total_expense_claim)],
		["Total Billable Amount", money(frm.doc.total_billable_amount)],
		["Total Billed Amount", money(frm.doc.total_billed_amount)],
		["Gross Margin", (frm.doc.gross_margin || 0) + "%"],
	];
	rows.forEach(([label, val]) => {
		$fields.append(`<div style="padding:8px 0;border-bottom:1px solid #e0e3e6;">
			<div style="font-size:11.5px;color:#8d99a3;margin-bottom:2px;">${label}</div>
			<div style="font-size:13px;">${val}</div>
		</div>`);
	});
	wrapper.append($fields);

	wrapper.append(`<div style="font-weight:600;font-size:12px;text-transform:uppercase;
		color:#8d99a3;margin:10px 0 6px;">Linked Selling Documents</div>`);

	["Sales Order", "Sales Invoice"].forEach((doctype) => {
		fetch_and_render(wrapper, doctype, [
			{ fieldname: "status", label: "Status" },
			{ fieldname: "grand_total", label: "Amount" },
		], { project: frm.doc.name });
	});

	wrapper.append(`<div style="font-size:11.5px;color:#8d99a3;margin-top:6px;">
		Costing is native ERPNext — these fields and documents aren't part of this app's data model,
		this tab just surfaces them alongside everything else.</div>`);
}

function render_timesheets_tab(frm) {
	const field = frm.get_field("timesheets_html");
	if (!field) {
		console.warn('[project.js] Field "timesheets_html" not found on this form — skipping Timesheets tab render.');
		return;
	}
	const wrapper = field.$wrapper;
	wrapper.empty();

	frappe.call({
		method: "erp_implementation.erp_implementation.api.get_project_timesheets",
		args: { project: frm.doc.name },
		callback: function (r) {
			const rows = r.message || [];
			const $table = $(`
				<table class="table table-bordered" style="margin-bottom:6px;">
					<thead><tr><th>ID</th><th>Employee</th><th>Hours</th><th>Status</th><th>Start Date</th></tr></thead>
					<tbody></tbody>
				</table>
			`);
			const $tbody = $table.find("tbody");
			if (!rows.length) {
				$tbody.append(`<tr><td colspan="5" class="text-muted">No timesheets logged against this project yet</td></tr>`);
			}
			rows.forEach((row) => {
				const $tr = $(`<tr style="cursor:pointer;"></tr>`)
					.on("click", () => frappe.set_route("Form", "Timesheet", row.name))
					.appendTo($tbody);
				$tr.append(`<td><a>${frappe.utils.escape_html(row.name)}</a></td>`);
				$tr.append(`<td>${frappe.utils.escape_html(row.employee || "")}</td>`);
				$tr.append(`<td>${row.total_hours || 0}</td>`);
				$tr.append(`<td>${status_pill(row.status)}</td>`);
				$tr.append(`<td>${row.start_date || ""}</td>`);
			});
			wrapper.append($table);
			wrapper.append(`<div style="font-size:11.5px;color:#8d99a3;">
				Timesheet's project link lives on its child rows (Timesheet Detail), not the header —
				this queries via the erp_implementation.api.get_project_timesheets whitelisted method.</div>`);
		},
	});
}
