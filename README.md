# Influencer Marketplace - BookMyInfluencers

This project is a dynamic Influencer Marketplace built with Next.js 15, Prisma, PostgreSQL, and Tailwind CSS.
It features functionality for Brands to discover influencers, negotiate campaigns, fund escrow, and for Influencers to manage jobs and earnings.

## Features

- **Authentication**: Role-based access (Brand, Influencer, Admin) using NextAuth.js.
- **Dynamic Discovery**: Search and filter influencers from the database.
- **Campaign Management**: Kanban board for tracking campaign candidates with status updates.
- **Negotiation Chat**: Real-time communication between Brands and Influencers.
- **Escrow Payments**: Secure checkout flow and earnings tracking.
- **Influencer Dashboard**: Overview of earnings, active jobs, and deliverable submission.

## Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide Icons.
- **Backend**: Next.js Server Components, Server Actions.
- **Database**: PostgreSQL with Prisma ORM.
- **Auth**: NextAuth.js (Credentials Provider).

## Database Setup

### Option A: Docker (Recommended)
1. Install Docker Desktop.
2. Run:
   ```bash
   docker-compose up -d
   ```
3. Your database is now ready at `postgresql://user:password@localhost:5432/bookmyinfluencers`.

### Option B: Manual Setup (Local Postgres)
1. Install PostgreSQL.
2. Open pgAdmin or psql and run:
   ```sql
   CREATE USER "user" WITH PASSWORD 'password';
   CREATE DATABASE "bookmyinfluencers";
   GRANT ALL PRIVILEGES ON DATABASE "bookmyinfluencers" TO "user";
   ALTER USER "user" CREATEDB;
   ```

### Initialize Database
Once DB is running:
1. `npm run db:setup` (Migrates and Seeds)

## End-to-End Testing Checklist

1.  **Brand Flow**:
    *   Login as Brand (`brand@nike.com` / `password123`).
    *   Go to `/brand/discover/advanced`, confirm influencers load.
    *   Go to `/brand/campaigns` (Kanban), move a card (Drag & Drop), verify status updates.
    *   Go to `/brand/chat`, send a message.
    *   Go to `/brand/checkout?contractId=...`, pay with mocked UPI, verify success screen.

2.  **Influencer Flow**:
    *   Login as Influencer (`sarah@influencer.com` / `password123`).
    *   Go to `/influencer/earnings`.
    *   Check statistics (Total/Pending).
    *   Click "Submit" on a pending deliverable, enter URL.
    *   Click "Withdraw" (if funds available).

3.  **Admin Flow**:
    *   Login as Admin (`admin@bookmyinfluencers.com` / `password123`).
    *   Go to `/admin/kyc`, approve a pending submission.
    *   Go to `/admin/payouts`, approve a withdrawal.

## Development Notes

The application uses Server Actions for mutations (`app/(brand)/actions.ts`, `app/(influencer)/actions.ts`).
**PRODUCTION READY**: Mock fallbacks have been removed. Ensure DB connection is active.
