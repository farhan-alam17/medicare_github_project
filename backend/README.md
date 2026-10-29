# Medicine Store API

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`, replace the MongoDB username, password, and
   cluster host in `MONGODB_URI`, set a private admin password, and configure
   the contact email SMTP settings.
3. In MongoDB Atlas, confirm the database user/password are valid and that the
   network access list permits connections from Render. In Render, set
   `MONGODB_URI` under the backend service's Environment settings to the same
   connection string. URL-encode special characters in the password. Never
   commit real credentials.
4. Start the API with `npm run dev` (or `npm start`).
5. Start the frontend from `frontend/app` with `npm run dev`.

The API listens on port 5001 by default. The frontend currently sends API
requests to `https://medicare-github-project.onrender.com`.
Check `https://medicare-github-project.onrender.com/api/health` after deploy:
`database` must be `connected` before the product route can succeed. If it is
`disconnected`, inspect the backend service logs in Render for the MongoDB
connection error, verify the `MONGODB_URI` environment variable, and redeploy
after correcting it.
The first successful MongoDB connection seeds the product collection if it is
empty. Admin sessions expire after eight hours and are held in server memory.
The storefront reads its catalog from MongoDB through the public product route;
returning to the storefront after admin changes reloads that catalog.

Contact form submissions are sent by the backend to `CONTACT_EMAIL` using Gmail
SMTP. To connect Gmail:

1. Enable 2-Step Verification on the Google account that will send the messages.
2. Create an App Password in that account's Google Account security settings.
3. In the ignored `backend/.env` file, set `SMTP_USER` to that Gmail address and
   `SMTP_PASSWORD` to its App Password. Do not use the regular Google password.
4. Keep `CONTACT_EMAIL` set to the inbox that should receive contact messages,
   then restart the backend.

The SMTP password is stripped of spaces before use, so it can be pasted as
Google displays it. Never commit SMTP credentials. The contact form reports
whether Gmail is not configured, rejected the login, or could not be reached.

## Routes

- `POST /api/admin/login`
- `GET /api/products`
- `POST /api/contact`
- `GET /api/admin/products` (admin token required)
- `POST /api/admin/products` (admin token required)
- `PATCH /api/admin/products/:id` (admin token required)
- `DELETE /api/admin/products/:id` (admin token required)
- `GET /api/health`