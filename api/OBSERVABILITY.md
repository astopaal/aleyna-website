# Observability

The API uses structured stdout logging with `nestjs-pino`.

## Logging Modes

Local development can use pretty logs:

```env
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

Docker and production should use JSON logs:

```env
LOG_LEVEL=info
LOG_FORMAT=json
```

The Docker Compose `api` service overrides `LOG_FORMAT=json` so Promtail can parse logs reliably for Loki.

## Loki Stack

Docker Compose includes:

- `loki`: log storage.
- `promtail`: Docker log collector.
- `grafana`: log UI.

Start the full stack:

```bash
docker compose up -d
```

Or only the logging stack:

```bash
npm run logs:stack
```

Grafana:

```txt
http://localhost:3001
```

Default local credentials:

```txt
admin / admin
```

Loki:

```txt
http://localhost:3100
```

## Useful LogQL Queries

All API logs:

```logql
{service="api"}
```

API errors:

```logql
{service="api", level="error"}
```

Public product requests:

```logql
{service="api"} |= "/api/public/products"
```

Slow-ish requests:

```logql
{service="api"} | json | response_time > 500
```

## Retention

Local retention is configured in `observability/loki-config.yml`:

```yaml
limits_config:
  retention_period: 168h
```

`168h` means 7 days. Increase this in staging/production based on disk capacity and compliance needs.

## Security

The logger redacts:

- `authorization`
- `cookie`
- `set-cookie`
- `password`
- `refreshToken`

Do not add request-body logging for sensitive admin endpoints unless fields are explicitly redacted.
