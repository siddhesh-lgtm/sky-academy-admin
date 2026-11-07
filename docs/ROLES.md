# SKY Academy — Role TLDR (current)

Legacy PDFs list more roles and app surfaces. **Use this list.**

---

## Web Admin (login to `sky-academy-admin`)

### SKY Super Admin
Platform owner. Full admin modules: centers + applications, users, staff, passports, sessions, bookings, assessments, payments, CMS, feature flags, settings/audit. Not limited to one center.

### Center Admin
Runs **one** coaching center. Sees center-scoped dashboard, staff, players, sessions, bookings, assessments, reports. No platform user admin, no finance authority, no CMS/feature flags.

### Finance / Accounts
Money and packages only: dashboard, passports (commercial view), payments, reports. No center staffing, scheduling, or CMS.

---

## Staff (assigned in Admin → Staff; separate Coach App later)

### Head Coach
Center coaching lead. Curriculum/quality oversight, guides coaches, reviews assessments/progression. Appears on staff roster; **does not** sign into Admin Web in this build.

### Coach
Delivers sessions, marks attendance, records assessments/evidence (Coach App later). Center-scoped assignment; **does not** sign into Admin Web.

---

## Members (not Admin Web users)

### Parent / Guardian
Books Passports/sessions, pays, consents, views child progress — in the **Parent App** (planned). Admin only manages/views linked records.

### Player (age 8–12)
Trains with Passport credits across **eligible centers**. No Admin Web login; no fixed “home center” ownership in this model.

---

## Legacy names → current mapping

| Legacy doc name | Current treatment |
|---|---|
| Platform Super Admin | **SKY Super Admin** |
| Academy Admin | Split: platform → Super Admin; center ops → **Center Admin** |
| Centre Ops | **Center Admin** (+ staff/session screens) |
| Head Coach / Coach | Staff records only (no web login) |
| Parent / Student | Other apps / member records |
| Personal coach marketplace roles | **Out of scope** for this admin FE |
