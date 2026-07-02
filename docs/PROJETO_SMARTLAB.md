# Desafio SmartLab de Rastreabilidade Industrial
## Especificação Técnica para Desenvolvimento com Claude Code

> Sistema WEB/Mobile de rastreabilidade digital de pontos de inspeção de SPDA (Sistema de Proteção contra Descargas Atmosféricas) via QR Code.
>
> **Stack definida:** Backend em Java Spring Boot · Frontend em Next.js · Banco de dados PostgreSQL

---

## 1. Visão Geral do Projeto

O sistema deve permitir que uma empresa (ex: Raízen, usada como estudo de caso) cadastre pontos físicos de inspeção de SPDA (caixas de inspeção, hastes captoras, isoladores, descidas, etc.), gere um **código único** e um **QR Code** para cada ponto, e permita que um técnico em campo escaneie o QR Code para:

1. Visualizar a **ficha digital** do ponto (dados cadastrais + histórico).
2. Registrar uma **nova inspeção** (medições, condição visual, conformidade, observações).
3. Consultar **indicadores/gráficos** agregados (médias, distribuição por status, evolução temporal etc.).

O grande diferencial exigido pelo desafio é que o sistema **não seja fixo para a Raízen**: todas as siglas de cliente, área e tipo de ponto devem ser **configuráveis** via uma tela de "Configurações do Sistema", permitindo reaproveitar o sistema para qualquer outra empresa/instalação no futuro.

Este documento serve como especificação funcional e técnica completa para orientar o desenvolvimento assistido por IA (Claude Code), cobrindo modelagem de dados, arquitetura, contratos de API, telas e um roadmap de implementação.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Observações |
|---|---|---|
| Backend | **Java 21 + Spring Boot 3.x** | Spring Web, Spring Data JPA, Spring Validation, springdoc-openapi (Swagger) |
| Banco de Dados | **PostgreSQL 16** | Via Docker Compose para dev local |
| Migração de schema | **Flyway** | Versionamento do schema do banco |
| Frontend | **Next.js 14+ (App Router) + TypeScript** | React Server/Client Components |
| Estilização | **Tailwind CSS** | Layout responsivo (mobile-first, pois o uso em campo é via celular) |
| Gráficos | **Recharts** ou **Chart.js** | Indicadores e visualizações |
| QR Code (geração) | **zxing** (Java) no backend, ou `qrcode` (npm) no frontend | Gerar QR apontando para URL `/pontos/{codigo}` |
| QR Code (leitura) | **html5-qrcode** ou **@zxing/browser** no frontend | Scanner via câmera do celular |
| Autenticação (opcional/desejável) | **Spring Security + JWT** | Login simples para responsáveis pela inspeção |
| Upload de imagens (opcional) | Armazenamento local em disco/S3-compatible (MinIO) na fase inicial | Fotos de referência e de inspeção |
| Containerização | **Docker + Docker Compose** | `postgres`, `backend`, `frontend` |
| Testes | JUnit 5 + Mockito (backend) / Vitest ou Jest (frontend) | Cobertura mínima dos services e endpoints críticos |

### Arquitetura geral

```
┌─────────────────────┐        REST/JSON        ┌──────────────────────────┐
│   Frontend Next.js   │ <---------------------> │   Backend Spring Boot     │
│  (App Router + TS)   │                          │  (Controller/Service/Repo)│
└─────────────────────┘                          └───────────┬──────────────┘
                                                               │ JPA/Hibernate
                                                               ▼
                                                     ┌──────────────────┐
                                                     │   PostgreSQL      │
                                                     └──────────────────┘
```

- O backend expõe uma **API REST** documentada via OpenAPI/Swagger (`/swagger-ui.html`).
- O frontend consome a API via `fetch`/`axios`, com camada de serviços isolada (`/lib/api/*`).
- QR Code aponta para uma rota pública do frontend: `https://<host>/pontos/{codigoPonto}`, que carrega a ficha digital daquele ponto ao ser acessada (a página faz o fetch no backend usando o código como identificador).

---

## 3. Modelagem de Dados (PostgreSQL)

A modelagem segue exatamente a lógica de configurabilidade exigida no desafio: **Cliente**, **Área** e **Tipo de Ponto** são entidades cadastráveis (não fixas em código), e o **código do ponto** é composto dinamicamente a partir delas.

### 3.1 Diagrama Entidade-Relacionamento (resumo)

```
Client (1) ──< Unit (1) ──< Area (1) ──< InspectionPoint (1) ──< Inspection
                                              │
PointType (1) ─────────────────────────────< InspectionPoint

User (opcional) (1) ──< Inspection
```

### 3.2 Tabelas

#### `clients` (Clientes)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | default `gen_random_uuid()` |
| name | VARCHAR(120) | obrigatório |
| acronym | VARCHAR(10) | obrigatório, único (ex: `RZ`) |
| created_at / updated_at | TIMESTAMP | auditoria |

#### `units` (Unidades/Plantas industriais)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| client_id | UUID (FK -> clients) | obrigatório |
| name | VARCHAR(120) | obrigatório |
| acronym | VARCHAR(10) | obrigatório |
| created_at / updated_at | TIMESTAMP | |

#### `areas` (Áreas da planta)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| unit_id | UUID (FK -> units) | obrigatório |
| name | VARCHAR(120) | ex: "Área dos Tanques" |
| acronym | VARCHAR(10) | ex: `TQ`, único por unidade |
| created_at / updated_at | TIMESTAMP | |

#### `point_types` (Tipos de ponto de inspeção)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR(120) | ex: "Caixa de inspeção no solo" |
| acronym | VARCHAR(10) | ex: `CI`, único |
| description | TEXT | opcional |
| created_at / updated_at | TIMESTAMP | |

> Pré-popular via Flyway (seed) com as siglas sugeridas no desafio: CI, CIP, DESC, CAP, HC, ISO, EQP, MALHA, CON, POSTE, EM, TQAT.

#### `inspection_points` (Pontos de inspeção)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| code | VARCHAR(60) | **gerado automaticamente**: `{CLIENTE}-SPDA-{AREA}-{TIPO}-{NUMERO}`; único |
| client_id | UUID (FK) | |
| unit_id | UUID (FK) | |
| area_id | UUID (FK) | |
| point_type_id | UUID (FK) | |
| sequence_number | INTEGER | número sequencial dentro do escopo cliente+área+tipo |
| location_description | VARCHAR(255) | ex: "Próximo ao Tanque 09" |
| description | TEXT | |
| criticality | VARCHAR(20) | ENUM: `BAIXA`, `MEDIA`, `ALTA` |
| status | VARCHAR(20) | ENUM: `ATIVO`, `INATIVO`, `DESATIVADO` |
| reference_photo_url | VARCHAR(500) | opcional |
| qr_code_url | VARCHAR(500) | link/arquivo do QR gerado |
| created_at / updated_at | TIMESTAMP | |

Índice único: `(client_id, area_id, point_type_id, sequence_number)` para gerar `sequence_number` corretamente.

#### `inspections` (Registros de inspeção)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| inspection_point_id | UUID (FK -> inspection_points) | obrigatório |
| inspection_date | DATE | obrigatório |
| responsible_name | VARCHAR(120) | ou FK para `users` se autenticação for implementada |
| visual_condition | VARCHAR(20) | ENUM: `BOA`, `REGULAR`, `RUIM` |
| electrical_continuity_mohm | NUMERIC(10,2) | miliohms, nullable |
| grounding_resistance_ohm | NUMERIC(10,2) | ohms, nullable |
| has_oxidation | BOOLEAN | default false |
| needs_correction | BOOLEAN | default false |
| is_conforming | BOOLEAN | obrigatório |
| observations | TEXT | |
| photo_url | VARCHAR(500) | opcional |
| created_at | TIMESTAMP | |

#### `users` (opcional — autenticação)
| Campo | Tipo | Regras |
|---|---|---|
| id | UUID (PK) | |
| name | VARCHAR(120) | |
| email | VARCHAR(150) | único |
| password_hash | VARCHAR(255) | BCrypt |
| role | VARCHAR(20) | ENUM: `ADMIN`, `TECNICO` |
| created_at | TIMESTAMP | |

### 3.3 Regra de geração do código do ponto

```
{SIGLA_CLIENTE}-SPDA-{SIGLA_AREA}-{SIGLA_TIPO}-{NUMERO_SEQUENCIAL_3_DIGITOS}
```
Exemplo: `RZ-SPDA-TQ-CI-001`

O número sequencial é calculado automaticamente no backend (próximo número disponível para a combinação cliente+área+tipo), mas o `SPDA` no meio é fixo por ora (poderia futuramente virar mais um campo configurável, "sistema inspecionado", caso se queira generalizar além de SPDA).

---

## 4. Estrutura do Backend (Spring Boot)

```
backend/
 ├── src/main/java/com/smartlab/rastreabilidade/
 │    ├── config/              → CORS, OpenAPI, Security (se aplicável)
 │    ├── client/               → ClientController, ClientService, ClientRepository, Client entity, DTOs
 │    ├── unit/                 → idem para Unit
 │    ├── area/                 → idem para Area
 │    ├── pointtype/             → idem para PointType
 │    ├── inspectionpoint/       → InspectionPointController/Service/Repository, geração de código e QR
 │    ├── inspection/            → InspectionController/Service/Repository
 │    ├── dashboard/            → DashboardController (indicadores agregados)
 │    ├── qrcode/                → QrCodeService (geração via zxing)
 │    ├── common/                → exceptions, ApiError, PageResponse<T>, mappers
 │    └── SmartLabApplication.java
 ├── src/main/resources/
 │    ├── application.yml
 │    └── db/migration/          → V1__init.sql, V2__seed_point_types.sql, ...
 └── build.gradle (ou pom.xml)
```

**Padrão de camadas:** Controller (REST) → Service (regra de negócio) → Repository (Spring Data JPA) → Entity.
DTOs de entrada/saída separados das entidades JPA (evitar expor entidade diretamente).

### 4.1 Endpoints REST principais

```
# Configurações do Sistema
GET    /api/clients
POST   /api/clients
PUT    /api/clients/{id}
DELETE /api/clients/{id}

GET    /api/clients/{clientId}/units
POST   /api/clients/{clientId}/units

GET    /api/units/{unitId}/areas
POST   /api/units/{unitId}/areas

GET    /api/point-types
POST   /api/point-types

# Pontos de Inspeção
GET    /api/inspection-points?clientId=&areaId=&pointTypeId=&status=
POST   /api/inspection-points
GET    /api/inspection-points/{code}          → ficha digital completa (usado pelo QR Code)
PUT    /api/inspection-points/{id}
DELETE /api/inspection-points/{id}
GET    /api/inspection-points/{id}/qrcode      → retorna imagem PNG/SVG do QR Code

# Inspeções
GET    /api/inspection-points/{code}/inspections
POST   /api/inspection-points/{code}/inspections
GET    /api/inspections/{id}

# Indicadores / Dashboard
GET    /api/dashboard/summary          → totais (pontos, inspecionados, conformes/não conformes)
GET    /api/dashboard/by-area
GET    /api/dashboard/by-type
GET    /api/dashboard/measurements-trend?pointCode=
```

Todas as respostas de listagem devem suportar paginação (`page`, `size`) e retornar um envelope padrão `PageResponse<T>`.

---

## 5. Estrutura do Frontend (Next.js)

```
frontend/
 ├── app/
 │    ├── (dashboard)/
 │    │    ├── page.tsx                     → Home / Dashboard geral
 │    │    ├── configuracoes/
 │    │    │    ├── clientes/page.tsx
 │    │    │    ├── areas/page.tsx
 │    │    │    └── tipos-de-ponto/page.tsx
 │    │    ├── pontos/
 │    │    │    ├── page.tsx                → listagem/filtro de pontos
 │    │    │    ├── novo/page.tsx           → cadastro de novo ponto
 │    │    │    └── [codigo]/
 │    │    │         ├── page.tsx           → ficha digital do ponto (acessada via QR Code)
 │    │    │         └── nova-inspecao/page.tsx
 │    │    └── indicadores/page.tsx         → gráficos e indicadores
 │    ├── layout.tsx
 │    └── globals.css
 ├── components/
 │    ├── ui/               → botões, inputs, cards (shadcn/ui opcional)
 │    ├── forms/            → ClientForm, AreaForm, PointTypeForm, InspectionPointForm, InspectionForm
 │    ├── charts/           → BarChartByType, PieChartConformity, LineChartTrend
 │    └── qrcode/           → QrCodeDisplay, QrCodeScanner
 ├── lib/
 │    ├── api/              → clients.ts, areas.ts, pointTypes.ts, inspectionPoints.ts, inspections.ts, dashboard.ts
 │    └── types/            → tipos TypeScript espelhando os DTOs do backend
 └── middleware.ts (se autenticação)
```

**Rota-chave do QR Code:** `/pontos/{codigo}` — deve funcionar como página pública (ou protegida, conforme decisão da equipe), pois é o destino direto do QR Code impresso/colado no ponto físico. Essa página faz `GET /api/inspection-points/{code}` e exibe:
- Dados cadastrais do ponto (ficha digital)
- Histórico de inspeções (tabela/lista)
- Botão "Registrar nova inspeção"

**Responsividade:** todo o fluxo de consulta de ponto e registro de inspeção deve ser **mobile-first**, já que o uso real em campo é via celular escaneando o QR Code.

---

## 6. Funcionalidades — Checklist de Escopo

### 6.1 Obrigatórias (MVP)
- [ ] Tela inicial / menu principal
- [ ] Tela de Configurações do Sistema (CRUD de clientes, unidades, áreas, tipos de ponto)
- [ ] Cadastro de pontos de SPDA com geração automática de código único
- [ ] Geração e associação de QR Code por ponto
- [ ] Tela de consulta da ficha digital do ponto (acessível via QR Code)
- [ ] Formulário de registro de inspeção (medições, condição visual, conformidade, observações)
- [ ] Listagem/histórico de inspeções por ponto
- [ ] Pelo menos um gráfico/indicador (ex: pontos por status de conformidade)
- [ ] Seed de pelo menos 15 pontos fictícios e 14+ inspeções simuladas

### 6.2 Desejáveis (diferenciais)
- [ ] Upload de fotos (ponto e inspeção)
- [ ] Leitura de QR Code via câmera (scanner web)
- [ ] Dashboard com múltiplos indicadores (médias, máx/mín, gráfico de barras, pizza, linha de tendência)
- [ ] Filtros por área, tipo de ponto e status
- [ ] Alerta visual para pontos não conformes / valores fora de faixa
- [ ] Exportação de dados (CSV) e geração de relatório em PDF
- [ ] Autenticação (Spring Security + JWT) com papéis Admin/Técnico
- [ ] Interface 100% responsiva
- [ ] Impressão/download em lote dos QR Codes gerados

---

## 7. Roadmap de Implementação Sugerido

1. **Infra base:** `docker-compose.yml` com Postgres; skeleton do backend Spring Boot; skeleton do frontend Next.js; Flyway com schema inicial (seção 3).
2. **Backend — Configurações:** CRUDs de `clients`, `units`, `areas`, `point_types` + seed inicial.
3. **Frontend — Configurações:** telas de cadastro correspondentes, consumindo a API.
4. **Backend — Pontos de inspeção:** endpoint de criação com geração automática de código; endpoint de geração de QR Code (retornando imagem apontando para `/pontos/{code}`).
5. **Frontend — Pontos:** listagem, formulário de novo ponto, página de ficha digital (`/pontos/[codigo]`).
6. **Backend — Inspeções:** endpoints de criação e listagem por ponto.
7. **Frontend — Inspeções:** formulário de nova inspeção + exibição do histórico na ficha do ponto.
8. **Seed de dados de demonstração:** 15 pontos + 14 inspeções fictícias (script SQL ou endpoint utilitário).
9. **Indicadores:** endpoint(s) de agregação no backend + gráficos no frontend (Recharts).
10. **Polimento:** responsividade mobile, leitura de QR via câmera, upload de fotos, filtros, exportação.
11. **Documentação final:** relatório técnico + preparação da apresentação (roteiro da seção 8 abaixo).

---

## 8. Roteiro Sugerido para Apresentação Final

1. Problema abordado (rastreabilidade de pontos de SPDA)
2. Proposta de solução (arquitetura Next.js + Spring Boot + Postgres)
3. Demonstração da tela de Configurações do Sistema
4. Demonstração do cadastro de cliente, área e tipo de ponto
5. Demonstração do cadastro de um ponto de SPDA (código gerado automaticamente)
6. Demonstração da geração/leitura do QR Code
7. Demonstração da ficha digital do ponto
8. Demonstração do registro de uma inspeção
9. Indicadores e gráficos
10. Dificuldades encontradas e melhorias futuras

---

## 9. Notas para o Claude Code

- Priorizar a **Opção 3** de tecnologias do desafio (WEB/Mobile avançado), já definida: Next.js + Spring Boot + PostgreSQL.
- Manter DTOs e validações (`@NotNull`, `@Size`, etc.) no backend; replicar validações espelhadas no frontend (Zod ou Yup + React Hook Form recomendado).
- Gerar o `docker-compose.yml` cedo no projeto para permitir rodar Postgres + backend + frontend localmente com um único comando.
- Ao implementar a geração de código do ponto, tratar concorrência (dois cadastros simultâneos não podem gerar o mesmo `sequence_number`) — usar constraint única + retry, ou sequence dedicada no banco.
- Ao gerar o QR Code, ele deve sempre apontar para a URL pública `/pontos/{code}` do frontend (não para um ID interno UUID), pois o código é o identificador amigável usado em campo.
- Seguir o checklist da seção 6 como fonte de verdade dos entregáveis mínimos exigidos pelo desafio.
