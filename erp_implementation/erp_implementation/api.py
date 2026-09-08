# Copyright (c) 2026, Syvasoft Business Solutions and contributors
# For license information, please see license.txt

import frappe


@frappe.whitelist()
def get_project_timesheets(project):
	"""Timesheet's `project` field lives on its child table (Timesheet Detail),
	not on the Timesheet header itself, so a plain frappe.client.get_list
	filter can't reach it directly — this does the join instead."""
	frappe.has_permission("Timesheet", "read", throw=True)

	return frappe.db.sql(
		"""
		select distinct ts.name, ts.employee, ts.total_hours, ts.status, ts.start_date
		from `tabTimesheet` ts
		inner join `tabTimesheet Detail` td on td.parent = ts.name
		where td.project = %s
		order by ts.modified desc
		limit 20
		""",
		project,
		as_dict=True,
	)
