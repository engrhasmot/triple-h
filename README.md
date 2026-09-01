# TRIPLE H PLANDRAFT & ENGINEERING

Professional civil engineering consultancy website built with Next.js 16 (App Router), MongoDB (Mongoose), Tailwind CSS v4, and shadcn-style UI components.

## Features

- **Public site** — Home, About, Services, Portfolio, Blog, FAQ, Team, Contact, Cost Estimator, Plan Tracking, Appointment Booking
- **Admin portal** (`/admin`) — Dashboard, Projects, Blog, Team, Testimonials, FAQs, Inquiries, Plan Files, Media, Activity Log, Analytics, Database backup
- **Role-based access** — `admin` and `editor` roles with per-resource permissions
- **JWT auth** — httpOnly cookie session (1 day)
- **Cloudinary** — image uploads with type/size validation
- **Email notifications** — SendGrid or console log provider

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in values:

   ```bash
   cp .env.example .env.local
   ```

   Required variables: `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`.

   > Generate a bcrypt hash for the admin password:
   > ```bash
   > node -e "require('bcryptjs').hash('your-password',10).then(console.log)"
   > ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001).

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------- |
| `npm run dev`    | Start development server (:3001)|
| `npm run build`  | Production build                |
| `npm run start`  | Start production server         |
| `npm run lint`   | ESLint (whole project)          |

## Project Structure

```
src/
├── app/
│   ├── (client)/        # Public pages
│   ├── (admin)/admin/   # Admin pages (protected)
│   ├── api/             # Route handlers
│   └── layout.tsx       # Root layout
├── components/          # UI + feature components
├── hooks/               # Shared React hooks
├── lib/                 # Auth, db, email, validators, permissions
├── models/              # Mongoose models
└── types/               # Shared TypeScript types
```

## Environment Variables

See `.env.example` for the full list with comments.

## Security Notes

- `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH` are **required** — the app refuses to start without them. Never rely on the local `.env.local` defaults in production.
- Admin API routes verify both the session cookie and role permissions.
- Uploads are restricted to common image types (max 10 MB).
- Login is rate-limited (10 attempts / 15 min per IP).
