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

Concluído:
- Schema completo do banco (todas as 7 tabelas da spec) + seed dos tipos de ponto,
  usuário admin e dados de demonstração (`V4__seed_demo_data.sql`: cliente
  Raízen/RZ, unidades, áreas, 17 `inspection_points` e 16 `inspections`).
- Entidades JPA + repositories para todas as tabelas.
- Cadastro/login de usuário com JWT (`/api/auth/register`, `/api/auth/login`).
- CRUD completo de `clients`, `units`, `areas`, `point-types`.
- `InspectionPoint`: service/controller/DTOs completos, com geração automática
  de código (`{CLIENTE}-SPDA-{AREA}-{TIPO}-{SEQ}`) e tratamento de concorrência
  via retry em transação isolada (`InspectionPointCodeAssigner`,
  `REQUIRES_NEW`). `client`/`unit` são derivados server-side da `Area`
  escolhida (não vêm no payload). QR Code é gerado no frontend (lib `qrcode`),
  sem endpoint de imagem no backend.
- `Inspection`: service/controller/DTOs completos
  (`/api/inspection-points/{code}/inspections`, `/api/inspections/{id}`); o
  `inspector` é resolvido do usuário autenticado, nunca do payload.
- `dashboard/DashboardController`: `GET /api/dashboard/summary` (totais,
  conformidade, inspeções hoje). `by-area`/`by-type`/`measurements-trend` da
  spec ainda não implementados (nenhuma tela atual depende deles).
- `/api/inspection-points/**` continua atrás de JWT (não está em
  `PUBLIC_ENDPOINTS`) — decisão tomada, não pendente.
- Renomear a sigla de um `Client`, `Area` ou `PointType` recompõe
  automaticamente o `code` de todos os `InspectionPoint` afetados
  (`InspectionPointCodeRegenerationService`, chamado a partir de
  `ClientService`/`AreaService`/`PointTypeService.update()` na mesma
  transação — se a recomposição colidir com um código já existente, a
  transação inteira reverte, inclusive a mudança de sigla, e retorna 409).
- `GlobalExceptionHandler.handleGeneric` loga a exception (`log.error`) antes
  de devolver o 500 genérico — sem isso, erros inesperados eram invisíveis
  nos logs do backend.
- Config comum: CORS, OpenAPI/Swagger, tratamento global de erros, paginação.
- Frontend: tema dark/verde único (sem modo claro) via tokens em
  `globals.css`, novos primitivos em `components/ui/` (Badge, CodeBadge,
  Switch, SegmentedControl, Select, Textarea, StatTile, ProgressBar), nav
  superior mantida (tab bar inferior do Figma fica para uma fase mobile
  futura).
- Telas reais e funcionais: Login/Registro, Home (`/`, indicadores +
  atividades recentes + busca manual de código), Pontos (agrupados por
  cliente, expansível), Cadastro de Ponto (`/pontos/novo`, com QR gerado após
  salvar), Ficha do Ponto (`/pontos/[codigo]`, histórico expansível com
  detalhe por inspeção e botão para gerar/baixar QR Code a qualquer momento),
  Nova Inspeção (`/pontos/[codigo]/nova-inspecao`), Configurações (visão geral
  + **Clientes** — tela única que agrupa Cliente → Unidades → Áreas com CRUD
  completo, edição inline e exclusão com confirmação em duas etapas — e Tipos
  de Ponto). `/configuracoes/areas` foi removida e agora redireciona para
  `/configuracoes/clientes` (áreas são gerenciadas lá, agrupadas por cliente).
- `frontend/lib/api/http.ts`: uma resposta 401/403 numa chamada autenticada
  limpa a sessão e redireciona para `/login` com mensagem "sessão expirou" —
  sem isso, um token expirado aparecia como "Erro inesperado ao comunicar com
  o servidor" (a resposta do Spring Security para isso não é JSON).
- `docker-compose.yml` + Dockerfiles de backend e frontend.

Pendente / adiado conscientemente (ver roadmap seção 7 do doc):
- Seção "Usuários" em Configurações (sem endpoint de listagem de usuários no
  backend — fora de escopo por ora).
- Upload real de fotos (ponto e inspeção ficam com preview local via
  `URL.createObjectURL`, sem persistir no servidor).
- Scanner de QR via câmera (Home usa digitação manual do código por enquanto,
  mesma rota de destino `/pontos/{code}` que um scanner real usaria).
- Exportação de relatório em PDF (link "Baixar Relatório" fica desabilitado).
- Tab bar inferior mobile (fase futura; hoje a nav superior é responsiva mas
  não replica o layout mobile do Figma).
- Gráficos de indicadores adicionais (`indicadores/page.tsx` continua
  placeholder) e exportação CSV.
