# Retrack — Next.js + Supabase (Auth)

This project is scaffolded with Next.js, Tailwind CSS and shadcn UI. I've added Supabase client and basic email/password auth forms for Register and Login.

Quick setup

1. Create a Supabase project at https://app.supabase.com.
2. From the project settings > API, copy the Project URL and anon public key.
3. Create a `.env.local` in the project root (add to .gitignore) and paste the values from `.env.example`.
4. Install dependencies and run the dev server:

```powershell
Set-Location -Path 'C:\Users\20dio\Desktop\retrack'
npm install
npm run dev
```

How Auth and DB relate

- Supabase Auth is a separate product that handles user registration, login, and session management. You do not need an additional database table just to use Auth with email/password — Supabase manages the auth users for you.
- If later you want to store application-specific user data (profiles, preferences), create a table in the Supabase database and join it to Auth users via `user.id` (the `sub` field).

Pages added
- `/register` — email/password sign-up (client-side using the Supabase JS client)
- `/login` — email/password sign-in

Notes
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present in `.env.local` before running.
- This setup uses client-side auth calls; for more secure flows you can implement server-side session handling or use middleware.
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
