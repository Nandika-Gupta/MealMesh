# MealMesh - Surplus Food Redistribution Network

DBMS Experiential Learning - Level 3 Project
PES University

## Problem Statement

MealMesh connects food providers (restaurants, bakeries, event organizers) with
surplus, edible food to nearby recipients (NGOs, shelters, individuals), reducing
food waste through a simple claim-and-pickup workflow.

## Team Details

- Nandika Gupta, PES2UG24CS303, Section E - Database design & implementation, backend integration
- Tanvi Magalur, PES2UG24CS257, Section E - Frontend (Next.js), authentication, UI

## Tech Stack

- **Frontend:** Next.js
- **Backend/API:** Next.js API routes
- **SQL Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **NoSQL Database:** MongoDB (hosted on [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Version Control:** Git + GitHub
- **Deployment:** Vercel

## Database Design

- `schema.sql` - full DDL: tables, constraints, indexes, view, trigger, stored
  function, and a sample transaction demo
- `NOSQL_DOCUMENTATION.md` - MongoDB collection structure and justification
- `er-diagram.png` - Entity-Relationship diagram (Chen notation)
- `relational-schema.png` - Relational schema diagram

### SQL Tables

| Table | Purpose |
|---|---|
| `Users` | Providers, recipients, and admins |
| `FoodCategories` | Lookup table for food types |
| `SurplusListings` | Food listings posted by providers |
| `Claims` | Recipient claims on listings |
| `Reviews` | Recipient reviews after pickup |

### Advanced Database Features

1. **Trigger** - `trg_claim_updates_listing`: automatically marks a listing as
   `claimed` when a new claim is inserted.
2. **Stored Function** - `get_available_listings_ranked()`: returns available
   listings ordered by expiry.
3. **View** - `available_listings_view`: joins listings, categories, and
   providers for currently available food.
4. **Transaction** - atomic claim operation: locks the listing row, inserts the
   claim, and relies on a `UNIQUE` constraint + trigger to prevent race
   conditions when two recipients attempt to claim the same listing.

## Environment Variables

The application requires the following environment variables (never committed
to source control):

```
DATABASE_URL=<Neon PostgreSQL connection string>
MONGODB_URI=<MongoDB Atlas connection string>
```

## Setup & Execution Instructions

1. Clone the repository:
   ```
   git clone <repo-url>
   cd mealmesh
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the project root with the environment
   variables listed above.
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

To recreate the database schema from scratch, run the contents of `schema.sql`
against a PostgreSQL instance (e.g. via the Neon SQL Editor or `psql`).

## Deployment

The application is deployed on [Vercel](https://vercel.com), with the SQL and
NoSQL databases hosted on Neon and MongoDB Atlas respectively, connected via
environment variables configured in the Vercel project settings. Live demo: https://mealmesh-three.vercel.app
