# Database Optimizations & Tunable Environment Variables

This document summarizes the indexing, query, and environment-variable recommendations applied to the project and a short guide for further tuning in staging/production.

**What I changed (quick)**

- Added targeted indexes on hot fields in `Company` and `HiringPartner` models.
- Added `.lean()` and projections for read-only queries to reduce Mongoose document overhead.
- Tuned `mongoose.connect()` with configurable pooling/timeouts.
- Made rate-limiter thresholds configurable via env variables and relaxed for tests.
- Defensive validation to reject extremely large signup payloads.

**Indexes added**

- Company model (`models/company.model.js`):
  - `createdAt: -1` — speeds sorting by newest companies.
  - `name: 1` — speeds exact-match lookups and prefix/range queries.
  - `role: 1` — speeds role-based filters.
  - Text index: `{ name: 'text', role: 'text', description: 'text' }` — supports simple text search queries across these fields.
- HiringPartner model (`models/hiringpartner.model.js`):
  - `name: 1` — speeds listing and lookups by name.
- User model: schema uses `unique: true` on `email` (no duplicate explicit index declared).

Notes on indexes

- Indexes improve read/query latency but increase write cost and storage. Only add indexes for fields used frequently in filters/sorts.
- For compound multi-field queries, create compound indexes that match the query's filter/sort order.
- Use `db.collection.createIndex()` with the `background: true` option during deployments to avoid blocking writes (or create indexes in a maintenance window).

**Environment variables (tunable)**

- MongoDB connection tuning (in `database.js`):
  - `MONGO_MAX_POOL_SIZE` (default 20) — maximum pool size for concurrent DB connections.
  - `MONGO_SERVER_SELECTION_MS` (default 5000) — server selection timeout.
  - `MONGO_SOCKET_TIMEOUT_MS` (default 45000) — socket timeout for operations.

- Rate limiter tuning (in `middleware/ratelimiter.js`):
  - `GLOBAL_RATE_MAX` — max requests per window for `globalLimiter` (default 300 in production).
  - `RATE_LIMIT_AUTH_MAX` — max requests per window for `authLimiter` (default 5 in production).
  - Note: test environment reduces/resets these defaults for test stability.

- Other important envs used by the project (keep secure and rotate as needed):
  - `JWT_SECRET` — token signing secret.
  - `MONGO_URI` — MongoDB connection URI.
  - `FRONTEND` — allowed CORS origin.
  - `EMAIL_USER`, `EMAIL_PASS` — for `nodemailer` transport (keep as secrets).

**How to create indexes in production (recommended)**

- Prefer creating indexes manually in production (via mongo shell or UI) with `background: true`:

```js
// mongo shell example
use your_database
db.companies.createIndex({ createdAt: -1 }, { background: true })
db.companies.createIndex({ name: 1 }, { background: true })
db.companies.createIndex({ role: 1 }, { background: true })
db.companies.createIndex({ name: 'text', role: 'text', description: 'text' }, { background: true })
```

**Monitoring & detecting unindexed queries**

- Use MongoDB Atlas/Cloud or `mongotop`/`mongostat` and the database profiler to find slow or unindexed queries.
- Run `explain()` on expensive queries to confirm they use indexes and check `IXSCAN` vs `COLLSCAN`.

**Practical tuning checklist (staging → production)**

1. Deploy indexes in staging and validate query `explain()` plans.
2. Load-test read-heavy and write-heavy scenarios (k6/artillery). Monitor latency, p95/p99, and MongoDB CPU.
3. Tune `MONGO_MAX_POOL_SIZE` according to app concurrency and DB resource limits.
4. If using multiple instances, switch rate-limiter store to Redis-backed store to enforce limits cluster-wide.
5. Add metrics & tracing (APM/OpenTelemetry) to measure DB op times and identify hotspots.

**Developer notes & best practices**

- Use `.lean()` whenever Mongoose document methods are not required for the response path.
- Prefer projections (`.select()`) to return only required fields for API responses.
- Avoid unnecessary `populate()`/`$lookup` unless required; consider embedding small frequently-read data.
- For complex aggregations, ensure `$match` and `$limit` are early in the pipeline and create indexes on `$match` fields.

If you'd like, I can:

- Add `docs/optimizations.md` (this file) to the repo (already created).
- Add example `k6` script and a short README for staging load tests.
- Implement Redis-backed rate limiter config and a small README for deployment.

---

Generated: May 12, 2026
