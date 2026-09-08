# Copyright (c) 2026, Syvasoft Business Solutions and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class FitGapAnalysis(Document):
	def on_update(self):
		"""Automation locked in scope discussion:
		When a Fit Gap Analysis is set to Approved, auto-create either a
		Configuration Register (Fit / Configuration gap type) or a
		Development Register (Development gap type) record, and auto-create
		a Task linked to that register and to the Project. Task assignment
		itself always stays a manual step (no auto-assignment)."""
		if self.status != "Approved":
			return

		if self.approved_by is None or self.approved_by == "":
			self.db_set("approved_by", frappe.session.user)
			self.db_set("approved_on", now_datetime())

		register_doctype = None
		if self.fit_type == "Fit (Standard)" or self.gap_type == "Configuration":
			register_doctype = "Configuration Register"
		elif self.gap_type == "Development":
			register_doctype = "Development Register"

		if not register_doctype:
			return

		existing = frappe.db.exists(register_doctype, {"fit_gap_analysis": self.name})
		if existing:
			return

		register = frappe.new_doc(register_doctype)
		register.project = self.project
		register.fit_gap_analysis = self.name
		register.description = self.analysis_notes or self.requirement_description
		register.insert(ignore_permissions=True)

		task = frappe.new_doc("Task")
		task.subject = f"{register_doctype}: {register.name}"
		task.project = self.project
		task.description = self.analysis_notes or self.requirement_description
		if register_doctype == "Configuration Register":
			task.custom_configuration_register = register.name
		else:
			task.custom_development_register = register.name
		task.insert(ignore_permissions=True)

		frappe.msgprint(
			f"Auto-created {register_doctype} {register.name} and Task {task.name}. "
			f"Assign the task manually."
		)
