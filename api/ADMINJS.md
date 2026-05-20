# AdminJS

AdminJS is mounted as an internal/backoffice panel at:

```txt
http://localhost:<API_PORT>/admin
```

It authenticates against the existing `User` table. Only active users with `SUPER_ADMIN` or `ADMIN` roles can log in.

## Exposed Resources

Editable:

- Product
- Category
- Slider
- Document
- Media

Read-only:

- User
- AuditLog

Hidden/not exposed:

- RefreshSession
- ProductCategory

## Environment

Set strong secrets in `.env`:

```env
ADMINJS_COOKIE_PASSWORD=replace-with-at-least-32-characters
ADMINJS_SESSION_SECRET=replace-with-at-least-32-characters
```

## Important Note

AdminJS writes directly through Prisma resources. It is useful as a fast internal tool, but it can bypass business logic in the service layer.

For critical public/admin workflows, prefer the existing Admin API endpoints because they run validation, audit logic, and service-level rules.
