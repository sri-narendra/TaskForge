# Run locally

Two things live here:
- `Tasks/` — the TaskForge app (backend API + frontend UI + tests)
- root `.env` + `connect-test.js` — quick MongoDB Atlas connectivity check

Requires: Node.js 18+.

## 1. Database

Both the app and the test need MongoDB. Either:

- **MongoDB Atlas** (used for this project) — put the connection URI in
  `Tasks/backend/.env`:

  ```
  NODE_ENV=development
  PORT=3000
  MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<name>
  JWT_SECRET=<random string at least 32 chars>
  CORS_ORIGIN=http://localhost:5500
  ALLOWED_ORIGINS=http://localhost:5500
  LOG_LEVEL=info
  ```

- **Local MongoDB** — run `mongod`, then set `MONGODB_URI=mongodb://127.0.0.1:27017/taskapp`.

## 2. Backend

```
cd Tasks/backend
npm install
npm start          # http://localhost:3000
```

- Health check: `curl http://localhost:3000/health`
- The server only starts listening after MongoDB connects, so wait ~10-60s.

## 3. Frontend

The UI is plain ES modules, so it must be served over HTTP (not `file://`):

```
cd Tasks
npx --yes serve -l 5500
```

Then open `http://localhost:5500`.

`config.js` auto-detects dev and points the UI at `http://localhost:3000`.

## 4. Tests

With the backend running:

```
cd Tasks/backend
npm test                     # smoke test only
node tests/security.test.js  # cross-user isolation
node tests/final_audit.test.js  # production readiness audit
```

Tests write throwaway users/data into the configured MongoDB — fine on a dev cluster.

## 5. Atlas connectivity check (optional)

```
npm install      # once, installs mongodb driver
node connect-test.js   # pings, inserts/reads/deletes a doc, uses root .env
```

## Known caveat

The frontend UI is wired to the new contract (axios, `/api` prefix, Bearer token, silent session refresh). If you see fetch errors, make sure the backend is running and `config.js` points at the right URL.
