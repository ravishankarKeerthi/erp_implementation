# Copyright (c) 2026, Syvasoft Business Solutions and contributors
# For license information, please see license.txt

from frappe import _


def get_data(data):
	"""Adds the 9 locked v2 implementation tabs to the Project record's
	native Connections tab, so every stage is reachable directly from the
	Project without a separate menu item.

	Costing is intentionally left out here — that tab is served by native
	ERPNext Selling/Accounts doctypes (Quotation, Sales Order, Sales
	Invoice) which already show under Project's own Connections."""

	data.setdefault("non_standard_fieldnames", {})

	data["transactions"] = list(data.get("transactions") or [])

	data["transactions"].append(
		{
			"label": _("Requirements & Fit-Gap"),
			"items": ["Requirement", "Fit Gap Analysis"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Configuration & Development"),
			"items": ["Configuration Register", "Development Register"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Data Migration"),
			"items": ["Data Migration"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Test / UAT"),
			"items": ["Test Case", "Defect", "UAT"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Go-Live"),
			"items": ["Go Live Checklist"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Onsite Visits"),
			"items": ["Onsite Visit"],
		}
	)
	data["transactions"].append(
		{
			"label": _("RAID"),
			"items": ["RAID Log"],
		}
	)
	data["transactions"].append(
		{
			"label": _("Governance"),
			"items": ["Status Update Log"],
		}
	)

	return data
