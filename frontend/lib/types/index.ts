export type Role = "ADMIN" | "TECNICO";

export type Criticality = "BAIXA" | "MEDIA" | "ALTA";

export type PointStatus = "ATIVO" | "INATIVO" | "DESATIVADO";

export type VisualCondition = "BOA" | "REGULAR" | "RUIM";

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface Client {
  id: string;
  name: string;
  acronym: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  acronym: string;
}

export interface Unit {
  id: string;
  clientId: string;
  name: string;
  acronym: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitRequest {
  name: string;
  acronym: string;
}

export interface Area {
  id: string;
  unitId: string;
  name: string;
  acronym: string;
  createdAt: string;
  updatedAt: string;
}

export interface AreaRequest {
  name: string;
  acronym: string;
}

export interface PointType {
  id: string;
  name: string;
  acronym: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PointTypeRequest {
  name: string;
  acronym: string;
  description?: string;
}

export interface InspectionPoint {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientAcronym: string;
  unitId: string;
  unitName: string;
  areaId: string;
  areaName: string;
  areaAcronym: string;
  pointTypeId: string;
  pointTypeName: string;
  pointTypeAcronym: string;
  sequenceNumber: number;
  locationDescription?: string;
  description?: string;
  criticality: Criticality;
  status: PointStatus;
  referencePhotoUrl?: string;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPointCreateRequest {
  areaId: string;
  pointTypeId: string;
  locationDescription?: string;
  description?: string;
  criticality: Criticality;
  status: PointStatus;
  referencePhotoUrl?: string;
}

export interface InspectionPointUpdateRequest {
  locationDescription?: string;
  description?: string;
  criticality: Criticality;
  status: PointStatus;
  referencePhotoUrl?: string;
}

export interface Inspection {
  id: string;
  inspectionPointId: string;
  inspectionPointCode: string;
  inspectionDate: string;
  responsibleName?: string;
  inspectorId?: string;
  inspectorName?: string;
  visualCondition: VisualCondition;
  electricalContinuityMohm?: number;
  groundingResistanceOhm?: number;
  hasOxidation: boolean;
  needsCorrection: boolean;
  conforming: boolean;
  observations?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface InspectionRequest {
  inspectionDate: string;
  responsibleName?: string;
  visualCondition: VisualCondition;
  electricalContinuityMohm?: number;
  groundingResistanceOhm?: number;
  hasOxidation: boolean;
  needsCorrection: boolean;
  conforming: boolean;
  observations?: string;
  photoUrl?: string;
}

export interface DashboardSummary {
  totalPoints: number;
  totalInspections: number;
  conformingCount: number;
  nonConformingCount: number;
  conformingPercentage: number;
  nonConformingPercentage: number;
  inspectionsToday: number;
}
