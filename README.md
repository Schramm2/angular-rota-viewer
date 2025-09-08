# Rota Viewer

A lightweight Angular app to visualise **daily team rosters** from JSON with **timezone-aware** times, **role-based** views, and **management reports** — all client-side.

---

## 🚀 Quickstart

Clone the repo and install dependencies:

```bash
npm ci
ng serve -o
````

Build for production:

```bash
ng build
```

Run tests:

```bash
ng test
# (with coverage)
ng test --code-coverage
```

---

## ✨ Features

* 📅 **Daily roster** (read-only) from `assets/data.json`
* 🔄 **Team/date switching** and **timezone conversion** (via Luxon)
* 📊 **Reports**: allocation, coverage %, fairness (σ) with clean charts
* 👥 **Roles**: member, team lead, manager, admin
* ♿ **Accessible**, **responsive** UI (Angular Material)
* ✅ **Test suite** for services, metrics, and smoke tests for components

---

## 📂 Project Structure

```
src/app/
  core/services/     # Data, timezone, role services
  features/roster/   # Daily roster view
  features/reports/  # Reports page (KPIs + charts)
  models.ts          # Entities and interfaces
src/assets/data.json # Sample dataset
```

## 🛠️ Design

### Entity Relationship Diagram

```mermaid
erDiagram
  TEAM ||--o{ MEMBER : has
  TEAM ||--o{ ROSTER : owns
  ROSTER ||--o{ SHIFT : contains
  MEMBER ||--o{ SHIFT : assigned_to

  TEAM {string id PK
        string name
        string timezone}
  MEMBER {string id PK
          string name
          string role
          string timezone
          bool isActive}
  ROSTER {string id PK
          string teamId FK
          string[] days}
  SHIFT {string id PK
         string date
         string start
         string end
         string task
         string memberId FK
         string teamId FK}
```

### Role Flow

```mermaid
flowchart TD
A[Open App] --> B[Select Team & Date]
B --> C{Role}
C -->|Member| D[Show my shifts + next shift]
C -->|Team Lead/Manager| E[Full team day roster + warnings]
C -->|Admin| F[Full roster + summary]
E --> G[Reports]
F --> G
```

---

## 📊 Tech Stack

* **Angular** (standalone components)
* **Angular Material** for UI
* **Chart.js + ng2-charts** for reports
* **Luxon** for timezone conversion
* **RxJS** for state & observables

---

## ♿ Accessibility & Responsiveness

* Keyboard-friendly navigation
* ARIA labels for interactive elements
* Adequate contrast and visible focus states
* Responsive layout (mobile → desktop)

---

## ⚠️ Limitations & Future Work

* Editing rosters (currently read-only)
* Multi-week grid view
* CSV/PDF export
* Authentication & user persistence
* Internationalisation (i18n)

