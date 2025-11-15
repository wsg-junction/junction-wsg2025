**Repo Overview**
- **Name**: `junction-app` (frontend) + `functions` (backend functions)
- **Purpose**: React + TypeScript single-page app with Firebase Cloud Functions for server logic and voice/AI integrations.
- **Language/Platform**: `TypeScript`, `React 19`, `Vite`, `Node (functions: 22)`.
````instructions
**Repo Summary**
- **Name**: `junction-app` (frontend) and `functions` (Firebase Cloud Functions)
- **Stack**: `React 19`, `TypeScript`, `Vite`, `Tailwind CSS`, `Firebase Functions (Node 22)`

**High-level Notes**
- Frontend entry: `src/main.tsx` → `src/App.tsx`; routes in `src/routes.tsx`.
- Cloud functions entry: `functions/src/index.ts` (build outputs to `lib/index.js`).
- Path alias `@` → `src` configured in `vite.config.ts` and TypeScript configs.
- Sample data: `src/products.json`; static assets in `public/product_images/`.

**How To Run (dev)**
- Install dependencies (root):

```bash
npm install
```

- Start frontend dev server (root):

```bash
npm run dev
```

- Functions (optional):

```bash
cd functions
npm install
npm run serve      # builds and starts the functions emulator
```

**Build & Preview**
- Build (root): `npm run build` (runs `tsc -b && vite build`).
- Preview production build: `npm run preview`.

**Linting**
- Run linters: `npm run lint`.

**Secrets & Security**
- The repo currently contains Firebase keys in `src/lib/firebaseConfig.ts` — treat these as secrets and rotate them before sharing or production use.
- Prefer environment variables or a secret manager for keys. Functions expect `VAPI_API_KEY` in the environment.
- When running the functions emulator, provide secrets via environment or `firebase functions:config:set`.

**Quick Agent Guidelines**
- Do not commit or log API keys. Convert hard-coded keys to `process.env` and add a `.env.example` instead.
- Keep TypeScript project references because `tsc -b` is used during build.
- `functions` targets Node 22; run `npm run build` in `functions/` before emulation or deploy.

**Files To Inspect First**
- `src/lib/firebaseConfig.ts` (contains Firebase API keys)
- `functions/src/index.ts` (uses `process.env.VAPI_API_KEY` and external SDK)
- `vite.config.ts`, `tsconfig.*.json` (aliases & project refs)

**Suggested Small Tasks**
- Add `.env.example` documenting required env vars (e.g. `VAPI_API_KEY`, `REACT_APP_GOOGLE_MAPS_KEY`).
- Replace hard-coded keys with `process.env` references and document local setup.
- Add a short `README` section showing how to run the functions emulator.

**Next Actions I Can Take**
- Add `.env.example` and update `src/lib/firebaseConfig.ts` to prefer environment variables.
- Run the dev server locally and report back (requires local Node/npm).

````
- Frontend: modern React + TypeScript with Tailwind + Radix; expects local dev via Vite.
