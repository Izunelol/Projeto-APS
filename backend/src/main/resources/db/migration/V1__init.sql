-- Schema inicial do SmartLab: cadastros configuráveis (cliente/unidade/área/tipo de ponto),
-- pontos de inspeção de SPDA, inspeções e usuários.

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    acronym VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_clients_acronym UNIQUE (acronym)
);

CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    acronym VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_units_client_acronym UNIQUE (client_id, acronym)
);

CREATE INDEX idx_units_client_id ON units (client_id);

CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units (id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    acronym VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_areas_unit_acronym UNIQUE (unit_id, acronym)
);

CREATE INDEX idx_areas_unit_id ON areas (unit_id);

CREATE TABLE point_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    acronym VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_point_types_acronym UNIQUE (acronym)
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'TECNICO',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMIN', 'TECNICO'))
);

CREATE TABLE inspection_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(60) NOT NULL,
    client_id UUID NOT NULL REFERENCES clients (id),
    unit_id UUID NOT NULL REFERENCES units (id),
    area_id UUID NOT NULL REFERENCES areas (id),
    point_type_id UUID NOT NULL REFERENCES point_types (id),
    sequence_number INTEGER NOT NULL,
    location_description VARCHAR(255),
    description TEXT,
    criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    reference_photo_url VARCHAR(500),
    qr_code_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_inspection_points_code UNIQUE (code),
    CONSTRAINT uq_inspection_points_sequence UNIQUE (client_id, area_id, point_type_id, sequence_number),
    CONSTRAINT ck_inspection_points_criticality CHECK (criticality IN ('BAIXA', 'MEDIA', 'ALTA')),
    CONSTRAINT ck_inspection_points_status CHECK (status IN ('ATIVO', 'INATIVO', 'DESATIVADO'))
);

CREATE INDEX idx_inspection_points_client_id ON inspection_points (client_id);
CREATE INDEX idx_inspection_points_area_id ON inspection_points (area_id);
CREATE INDEX idx_inspection_points_point_type_id ON inspection_points (point_type_id);
CREATE INDEX idx_inspection_points_status ON inspection_points (status);

CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_point_id UUID NOT NULL REFERENCES inspection_points (id) ON DELETE CASCADE,
    inspection_date DATE NOT NULL,
    responsible_name VARCHAR(120),
    inspector_id UUID REFERENCES users (id),
    visual_condition VARCHAR(20) NOT NULL,
    electrical_continuity_mohm NUMERIC(10, 2),
    grounding_resistance_ohm NUMERIC(10, 2),
    has_oxidation BOOLEAN NOT NULL DEFAULT false,
    needs_correction BOOLEAN NOT NULL DEFAULT false,
    is_conforming BOOLEAN NOT NULL,
    observations TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_inspections_visual_condition CHECK (visual_condition IN ('BOA', 'REGULAR', 'RUIM'))
);

CREATE INDEX idx_inspections_inspection_point_id ON inspections (inspection_point_id);
CREATE INDEX idx_inspections_inspection_date ON inspections (inspection_date);
