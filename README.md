This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## SMS (booking confirmation & reminders)

Booking confirmation and status-update SMS use **Tilil**. Add these to your `.env`:

- `TILIL_API_KEY` – from your Tilil dashboard  
- `TILIL_SHORTCODE` – your Tilil shortcode  
- `SMS_ENDPOINT` – Tilil SMS API URL (e.g. `https://api.tilil.com/v1/sms/send`)

Optional:

- `TILIL_BALANCE_ENDPOINT` – for SMS credit balance in the app (if your provider supports it)  
- `CRON_SECRET` – secret for securing the reminders cron (e.g. `Authorization: Bearer <CRON_SECRET>`)

If the main three are missing, bookings still succeed but no SMS is sent. The confirmation page will show whether an SMS was sent.

**SMS module (after running migration 003):**

- **Status-update SMS**: When reception changes a booking to *confirmed* or *cancelled*, an SMS is sent to the client (respects opt-out). Uses retry on failure and is logged in SMS history.
- **Scheduled reminders**: 1 day and 2 hours before appointment (configurable in `sms_reminder_settings`). Call `GET /api/cron/reminders` on a schedule (e.g. every 15 min via Vercel Cron; see `vercel.json`).
- **Manual Send SMS**: Reception (Manage booking → Send SMS) and client detail page (Send SMS button).
- **SMS history**: Per client under the client’s SMS section; delivery status (sent/failed) and failure reason when applicable.
- **Opt-in/opt-out**: Client profile has an “SMS opt-in” toggle (PATCH `sms_opt_in`); manual and bulk SMS respect it.
- **Configurable templates**: `GET /api/sms/templates`, `PATCH /api/sms/templates/[id]` for body/description.
- **Bulk SMS**: `POST /api/sms/bulk` with `client_ids` and `message` (only to opted-in clients with phone).
- **Credit balance**: `GET /api/sms/balance` (when `TILIL_BALANCE_ENDPOINT` is set).

## Client management (database migration)

The app uses a separate **clients** table with full profiles (Client ID, DOB, gender, address, emergency contact, skin type, allergies, status, visit history, etc.). To create the table and backfill from existing users:

```bash
node scripts/run-clients-migration.js
```

Ensure `DATABASE_URL` is set in `.env`. The script applies `db/migrations/001_clients.sql` and backfills `client_id` on appointments, queue, and patient_records from existing user data. After this, reception can use **Clients** and **New Booking** (select or register client) and bookings/queue/records use the client entity.

For the **SMS module** (templates, logs, opt-in, reminders), run:

```bash
node scripts/run-sms-migrations.js
```

This applies `db/migrations/003_sms_system.sql` and `004_sms_same_day_and_templates.sql` (adds `clients.sms_opt_in`, `sms_templates`, `sms_logs`, `sms_reminder_settings`, same-day reminder, and follow-up/promotional/birthday templates). **Admins**: go to Dashboard → **SMS Settings** to manage templates, reminder timing (1 day / same day / 2 hours), credit balance, delivery report, and bulk SMS.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
