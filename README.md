# TalentFlow ATS

A lightweight, high-performance Applicant Tracking System (ATS) MVP built for the ProVA Web Developer assessment.

## Tech Stack

* **Framework:** SvelteKit (chosen for zero-boilerplate reactivity and seamless server actions)
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM
* **Styling:** Vanilla CSS (leveraging CSS variables for dynamic theming)
* **Authentication:** Better Auth (configured and ready for credential/OAuth integration)

## Core Features

* **Pipeline Management:** Native HTML5 drag-and-drop Kanban board with optimistic UI updates for frictionless stage transitions.
* **Candidate Management:** Comprehensive creation modal and drawer interface to add, review, and archive applicant profiles.
* **Real-time Discovery:** Instant client-side reactive filtering by role, minimum rating, and keyword search across names, emails, and skills.
* **Evaluation Tools:** Interactive, pure-CSS star rating system and a chronological interview notes stream.
* **Data Persistence:** Fully backed by a PostgreSQL database, ensuring all pipeline movements, notes, and profile updates persist reliably.

## Technical Decisions

* **Vanilla CSS Architecture:** Opted for pure CSS with CSS variables to handle Light/Dark mode theming, ensuring complete control over the layout and reducing dependency overhead.
* **Optimistic UI:** Drag-and-drop actions immediately update the client state while the server resolves the database update asynchronously, eliminating visual lag.
* **Progressive Enhancement:** Leveraged SvelteKit's `use:enhance` to handle form submissions (notes, candidate creation, stage updates) seamlessly without full page reloads.

## Future Roadmap & Scalability

While this MVP delivers the core requirements, the architecture is designed to support enterprise-grade expansion:

* **Role-Based Access Control (RBAC):** Implement granular permissions allowing recruiters full pipeline control, while restricting hiring managers to view-only, notes, and rating access.
* **Automated Ingestion API:** Expose secure webhook endpoints to automatically funnel candidates into the "Applied" column directly from external job boards or custom career pages.
* **Team Workspaces:** Introduce multi-tenant isolation so different departments (e.g., Engineering, Design, Sales) can maintain entirely separate hiring boards.
* **Activity Audit Logging:** Track every stage movement, rating change, and note addition with strict timestamps and user IDs for compliance and pipeline analytics.

## Local Setup

1. Clone the repository and navigate into the project directory.
2. Run `npm install` to install all packages and dependencies.
3. Duplicate `.env.example` to create a `.env` file, and fill in your `DATABASE_URL` and any other required environment variables.
4. Run the following database commands sequentially to set up your schema and push it to your PostgreSQL instance:
* `npm run auth:schema`
* `npm run db:generate`
* `npm run db:push`


5. Run `npm run dev` to start the local development server.
6. Once the app is running, click **Load Demo Data** on the dashboard to instantly populate the board with a sample set of candidates.

---

**Author:** Ovieta
