# PulseMarket

Dashboard de analítica y gestión de e-commerce en tiempo real. Proyecto del Concurso de Vibe Coding Universitaria.

**Stack:** Next.js (App Router) · TypeScript estricto · Tailwind CSS · PostgreSQL + Prisma · Auth.js (Google y GitHub) · Zod · Vitest · Playwright.

## Puesta en marcha

```bash
cd pulsemarket
npm install
cp .env.example .env      # completa las variables (ver abajo)
npx prisma migrate deploy # aplica las migraciones
npm run db:seed           # inserta 18,000+ registros de ejemplo
npm run dev
```

Scripts útiles: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión de PostgreSQL (Neon o Supabase; en Vercel usa la conexión con pooler). |
| `AUTH_SECRET` | Secreto para firmar la sesión. Genera uno con `npx auth secret`. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Credenciales de la OAuth App de Google. |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | Credenciales de la OAuth App de GitHub. |
| `AUTH_TRUST_HOST` | `true` solo al ejecutar `next start` fuera de Vercel (por ejemplo, en CI). |
| `E2E_TEST_MODE` / `E2E_TEST_SECRET` | Solo para pruebas E2E. **Nunca** definirlas en producción. |

## Crear las OAuth Apps

**Google** (Google Cloud Console → APIs y servicios → Credenciales → Crear ID de cliente de OAuth, tipo "Aplicación web"):

- Orígenes autorizados: `http://localhost:3000` y la URL de producción.
- URI de redirección autorizados: `http://localhost:3000/api/auth/callback/google` y `https://<tu-dominio>/api/auth/callback/google`.

**GitHub** (Settings → Developer settings → OAuth Apps → New OAuth App):

- Homepage URL: `http://localhost:3000` (o la URL de producción).
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`. GitHub admite una sola URL por app, así que crea una app para desarrollo y otra para producción.

## Seguridad y autenticación

- El inicio de sesión de producción es exclusivamente con Google y GitHub (`src/auth.ts`).
- La sesión es un JWT guardado en una cookie HttpOnly.
- `src/proxy.ts` es el middleware de seguridad (en Next.js 16 el archivo `middleware.ts` pasó a llamarse `proxy.ts`). Protege `/dashboard/*` y las APIs internas: las páginas redirigen a `/login` y las APIs responden `401`.
- Defensa en profundidad: el layout del dashboard y las rutas de API vuelven a comprobar la sesión en el servidor.
- Las reglas de qué rutas están protegidas viven en `src/lib/route-access.ts`. El `matcher` de `src/proxy.ts` debe mantenerse sincronizado con ellas.

### Login para pruebas E2E

Google y GitHub bloquean los inicios de sesión automatizados (CAPTCHA, 2FA), así que Playwright no puede usarlos. Con `E2E_TEST_MODE=true` y un `E2E_TEST_SECRET` de al menos 16 caracteres se habilita un proveedor de pruebas que crea una sesión para un usuario ficticio. Está desactivado siempre en el entorno de producción de Vercel (`VERCEL_ENV=production`).

## Modelo de datos

`Customer`, `Product` (con borrado lógico mediante `isDeleted` / `deletedAt`), `Sale` y `Task` (tarjetas del Kanban: `status` es la columna y `position` el orden dentro de ella). Los índices están pensados para que los filtros y la paginación sobre 10,000+ registros respondan en menos de 400 ms.
