# AGENTS.md — SmartLab (Rastreabilidade Industrial de SPDA)

Guia para agentes de IA (e humanos) trabalhando neste repositório. A especificação
funcional completa está em `docs/PROJETO_SMARTLAB.md` — leia lá antes de
implementar qualquer funcionalidade nova; este arquivo cobre apenas convenções,
estrutura e o estado atual do projeto.

## Stack

- **Backend:** Java 21 + Spring Boot 3.5.16 (Maven, sem Maven local necessário —
  use `./mvnw`). Spring Web, Spring Data JPA, Spring Security + JWT, Flyway,
  springdoc-openapi, Lombok.
- **Banco:** PostgreSQL 16 (via Docker Compose).
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS.
- **Orquestração local:** `docker-compose.yml` na raiz (postgres + backend + frontend).

## Estrutura do repositório

```
backend/    → API Spring Boot (pacotes por feature: client, unit, area, pointtype,
              inspectionpoint, inspection, user, auth, config, common)
frontend/   → Next.js App Router (app/, components/, lib/api/, lib/types/)
docs/       → Especificação funcional (PROJETO_SMARTLAB.md)
docker-compose.yml
```

## Como rodar localmente

**Tudo via Docker (mais simples):**
```
docker compose up --build
```
Backend em `http://localhost:8080` (Swagger em `/swagger-ui.html`), frontend em
`http://localhost:3000`, Postgres em `localhost:5432` (db/user/senha: `smartlab`).

Login padrão (seed `V3__seed_admin_user.sql`, papel `ADMIN`):
`admin@smartlab.com` / `admin1234`.

**Backend isolado (sem Docker):** precisa de um Postgres rodando (pode subir só
o serviço `postgres` do compose) e então `cd backend && ./mvnw spring-boot:run`.
Variáveis de ambiente em `backend/src/main/resources/application.yml` (todas têm
default de dev local).

**Frontend isolado:** `cd frontend && npm install && npm run dev`. Copie
`frontend/.env.local.example` para `.env.local` e ajuste `NEXT_PUBLIC_API_URL`
se o backend não estiver em `localhost:8080`.

## Convenções do backend

- Pacote por feature (não por camada): cada entidade de domínio tem sua própria
  pasta com `Entity`, `Repository`, `Service`, `Controller` e um subpacote `dto/`.
- Nunca expor entidades JPA diretamente nos endpoints — sempre DTOs de
  request/response (`*Request`, `*Response`, com `Response.from(entity)` estático).
- Listagens paginadas retornam `common.PageResponse<T>`; listas simples (ex.
  unidades de um cliente) retornam `List<T>` direto.
- Exceções de negócio: `common.NotFoundException` (404) e `common.ConflictException`
  (409), tratadas globalmente em `common.GlobalExceptionHandler`.
- Auditoria (`createdAt`/`updatedAt`) via `common.Auditable` (`@MappedSuperclass`
  com `@PrePersist`/`@PreUpdate`) — estenda essa classe em vez de duplicar campos.
- Migrations Flyway em `src/main/resources/db/migration`, numeradas
  `V{n}__descricao.sql`. Nunca edite uma migration já aplicada; crie uma nova.
- Auth: JWT stateless (`Authorization: Bearer <token>`), gerado em
  `POST /api/auth/login` e `POST /api/auth/register`. Papéis: `ADMIN`, `TECNICO`.
  Registro público hoje aceita `role` no payload (default `TECNICO`) — antes de ir
  para produção, restrinja a criação de `ADMIN` a um endpoint autenticado.

## Convenções do frontend

- App Router com um grupo de rotas `(dashboard)` que aplica um shell autenticado
  (`components/layout/DashboardShell.tsx`, guarda de sessão client-side via
  `lib/hooks/useSession.ts`). `/login` e `/registro` ficam fora do grupo.
- Sessão hoje é armazenada em `localStorage` (`lib/api/session.ts`) — simples e
  suficiente para o MVP, mas não é a abordagem recomendada para produção
  (considerar cookies httpOnly + rota `proxy.ts` se isso evoluir).
- Toda chamada à API passa por `lib/api/http.ts` (`apiFetch`), que já injeta o
  header `Authorization` e lança `ApiError` com a mensagem vinda do backend.
- Tipos em `lib/types/index.ts` espelham os DTOs do backend manualmente — ao
  mudar um DTO no backend, atualize o tipo correspondente aqui também.
- **Next.js 16:** `params`/`searchParams` de páginas são `Promise` — sempre
  `await params`. O antigo `middleware.ts` agora se chama `proxy.ts` (mesma
  função, nome novo). Antes de usar uma API que pareça familiar, confira
  `frontend/node_modules/next/dist/docs/` — o `frontend/AGENTS.md` já avisa
  sobre isso.
- Regra de lint `react-hooks/set-state-in-effect` está desligada em
  `eslint.config.mjs` (motivo documentado ali): o projeto usa o padrão comum de
  ler estado (localStorage, fetch) em `useEffect` + `useState`.

## Estado atual (o que já existe)

Concluído (etapa "base do projeto"):
- Schema completo do banco (todas as 7 tabelas da spec) + seed dos tipos de ponto.
- Entidades JPA + repositories para todas as tabelas.
- Cadastro/login de usuário com JWT (`/api/auth/register`, `/api/auth/login`).
- CRUD completo de `clients`, `units`, `areas`, `point-types`.
- Config comum: CORS, OpenAPI/Swagger, tratamento global de erros, paginação.
- Frontend: skeleton Next.js/Tailwind, tipos, camada de API, telas de
  login/registro funcionais, shell autenticado, tela de Clientes (CRUD completo
  end-to-end como referência), demais telas como placeholders navegáveis.
- `docker-compose.yml` + Dockerfiles de backend e frontend.

Pendente (próximas etapas do roadmap, seção 7 do doc):
- `InspectionPoint`/`Inspection`: só têm entidade + repository; faltam
  service/controller, geração automática de código (`{CLIENTE}-SPDA-{AREA}-{TIPO}-{SEQ}`)
  com tratamento de concorrência, e geração de QR Code.
- Endpoints e telas de indicadores/dashboard.
- Telas reais de Units/Areas/PointTypes/Pontos (hoje só Clientes está completo
  como referência).
- Decidir se `/pontos/{codigo}` (ficha digital via QR) fica público ou exige login.
- Seed de dados de demonstração (15 pontos + 14 inspeções).
- Upload de fotos, scanner de QR via câmera, exportação CSV/PDF.
