# SmartLab — Rastreabilidade Industrial de SPDA

Sistema web de rastreabilidade digital de pontos de inspeção de SPDA (Sistema
de Proteção contra Descargas Atmosféricas) via QR Code: cadastro de
clientes/unidades/áreas/tipos de ponto (tudo configurável, não fixo para uma
empresa específica), geração automática de código único por ponto, registro
de inspeções em campo e indicadores de conformidade.

Especificação funcional completa em [`docs/PROJETO_SMARTLAB.md`](docs/PROJETO_SMARTLAB.md).
Convenções e estado atual do projeto em [`AGENTS.md`](AGENTS.md).

## Stack

- **Backend:** Java 21 + Spring Boot 3.5 (Maven), Spring Web, Spring Data JPA,
  Spring Security + JWT, Flyway, springdoc-openapi.
- **Banco:** PostgreSQL 16.
- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS.
- **Orquestração local:** Docker + Docker Compose.

## Como rodar (Docker — recomendado)

Pré-requisitos: [Docker](https://www.docker.com/) e Docker Compose (já
incluído no Docker Desktop).

```bash
docker compose up --build
```

Isso sobe três serviços:

| Serviço | URL | Observações |
|---|---|---|
| Frontend | http://localhost:3000 | Next.js |
| Backend | http://localhost:8080 | Swagger em `/swagger-ui.html` |
| PostgreSQL | localhost:5432 | banco/usuário/senha: `smartlab` |

Na primeira subida, o Flyway aplica as migrations automaticamente
(schema + seed de tipos de ponto, usuário admin e dados de demonstração —
cliente Raízen com pontos e inspeções de exemplo).

**Login padrão:** `admin@smartlab.com` / `admin1234`

Para derrubar os containers: `docker compose down` (adicione `-v` para também
apagar o volume do Postgres e recomeçar do zero).

## Como rodar sem Docker

### Backend

Precisa de um PostgreSQL rodando (pode ser só o serviço `postgres` do
compose: `docker compose up -d postgres`).

```bash
cd backend
./mvnw spring-boot:run
```

Variáveis de ambiente (todas com default de dev local em
`src/main/resources/application.yml`):

| Variável | Default | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do Postgres |
| `DB_PORT` | `5432` | Porta do Postgres |
| `DB_NAME` | `smartlab` | Nome do banco |
| `DB_USER` | `smartlab` | Usuário do banco |
| `DB_PASSWORD` | `smartlab` | Senha do banco |
| `JWT_SECRET` | (dev only, veja `application.yml`) | Segredo para assinar os tokens JWT |
| `JWT_EXPIRATION_MINUTES` | `480` | Validade do token (8h) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Origens permitidas |
| `SERVER_PORT` | `8080` | Porta do backend |

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # ajuste NEXT_PUBLIC_API_URL se o backend não estiver em localhost:8080
npm run dev
```

## Estrutura do repositório

```
backend/    → API Spring Boot (pacotes por feature: client, unit, area,
              pointtype, inspectionpoint, inspection, dashboard, user, auth,
              config, common)
frontend/   → Next.js App Router (app/, components/, lib/api/, lib/types/)
docs/       → Especificação funcional (PROJETO_SMARTLAB.md)
docker-compose.yml
```

## Documentação da API

Com o backend rodando, a documentação interativa (Swagger UI) fica em
http://localhost:8080/swagger-ui.html.
