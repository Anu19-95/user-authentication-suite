# AuthSuite

AuthSuite is a polished front-end demonstration of an enterprise identity and access management experience. It brings common authentication workflows into one interface, including password sign-in, account creation, password recovery, magic-link login, two-factor authentication, session management, role-based access control, and security audit logs.

Intern ID: CITS7955

## Features

- Password sign-in with a remember-me option and show/hide password control
- Account registration with live password-strength analysis and role selection
- Password recovery flow with verification code and password reset steps
- Passwordless sign-in through a simulated single-use magic link
- TOTP-style two-factor authentication setup and six-digit verification flow
- Role-aware dashboard views for `admin`, `developer`, and `member` users
- Active session list with individual and bulk session revocation
- Password changes with strength and confirmation validation
- Security activity timeline covering logins, failed attempts, 2FA, and sessions
- Client-side rate limiting and account lockout simulation for failed logins
- Toast notifications and responsive layouts for desktop and mobile screens

## Demo Accounts

The app includes seed accounts so the workflows can be explored immediately:

| Role | Email | Password | 2FA |
| --- | --- | --- | --- |
| Admin | `admin@company.com` | `Admin@123` | Enabled |
| Developer | `dev@company.com` | `DevPass@123` | Disabled |
| Member | `member@company.com` | `Member@123` | Disabled |

The sign-in screen also provides one-click test-account buttons. These credentials are for the local demonstration only and must not be used in a real deployment.

## Run Locally

### Prerequisites

 - Node.js 18 or newer
 - npm

### Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. On macOS or Linux, use `cp .env.example .env.local` instead of the Windows `copy` command.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000 |
| `npm run build` | Create an optimized production bundle |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run the TypeScript compiler without emitting files |
| `npm run clean` | Remove generated build and server files |

## Project Structure

```text
src/
├── App.tsx                    Application state and authentication flows
├── index.css                  Global styles and responsive design tokens
├── types.ts                   Shared domain types
├── components/
│   ├── Dashboard.tsx           Authenticated dashboard and security views
│   ├── SignInCard.tsx          Password sign-in form
│   ├── SignUpCard.tsx          Registration form
│   ├── ForgotPasswordCard.tsx  Password recovery flow
│   ├── MagicLinkCard.tsx       Passwordless login flow
│   ├── TwoFactorModal.tsx      2FA setup and verification
│   └── ...                     Navigation, alerts, and password controls
└── utils/
	└── authStorage.ts          Local users, sessions, logs, and auth helpers
```

## Security Scope

AuthSuite is a front-end simulation intended for prototyping, demonstrations, and UI exploration. User records, sessions, and audit logs are stored in browser `localStorage`; passwords and tokens are not protected by a production server. Before using this as a real authentication system, replace the local storage layer with a backend identity provider or secure API, use server-side password hashing, protect secrets, add real email delivery, and enforce authorization on the server.

## Technology

- React 19 and TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Motion for interface animation
