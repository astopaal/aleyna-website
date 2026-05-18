# Database Startup

Docker Compose starts PostgreSQL and runs Prisma migrations before the API starts.

Flow:

```txt
postgres healthcheck passes
migrate service runs prisma migrate deploy
api starts only if migrate succeeds
```

Start everything:

```bash
docker compose up -d
```

Run migrations manually:

```bash
npm run db:deploy
```

Seed the first admin user manually when needed:

```bash
npm run seed
```

When using Docker Compose, run seed inside a temporary API container:

```bash
docker compose run --rm api npm run seed
```

The seed is intentionally not part of automatic startup because it creates a default admin account. Change the credentials in `prisma/seed.ts` before using it outside local development.
