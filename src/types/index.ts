/* ─────────── Enums ─────────── */

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ConstructionClass {
  KELAS_1 = 'KELAS_1',
  KELAS_2 = 'KELAS_2',
  KELAS_3 = 'KELAS_3',
}

/* ─────────── Models ─────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
}

export interface OccupationType {
  id: string;
  code: string;
  name: string;
  premiumRate: number;
}

export interface InsuranceRequest {
  id: string;
  userId: string;
  invoiceNumber: string;
  occupationTypeId: string;
  buildingPrice: number;
  duration: number;
  constructionClass: ConstructionClass;
  address: string;
  province: string;
  city: string;
  district: string;
  area: string;
  earthquake: boolean;
  basicPremium: number;
  adminFee: number;
  totalAmount: number;
  status: RequestStatus;
  policyNumber: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  occupationType?: OccupationType;
}

export interface Policy {
  id: string;
  policyNumber: string;
  applicationNumber: string;
  name: string;
  branchId: string;
  birthDate: string;
  duration: number;
  buildingPrice: number;
  occupationTypeId: string;
  premium: number;
  createdAt: string;
  branch?: Branch;
  occupationType?: OccupationType;
}

/* ─────────── Auth ─────────── */

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/* ─────────── Request Payloads ─────────── */

export interface CreateInsuranceRequestPayload {
  occupationTypeId: string;
  buildingPrice: number;
  duration: number;
  constructionClass: ConstructionClass;
  address: string;
  province: string;
  city: string;
  district: string;
  area: string;
  earthquake?: boolean;
}

export interface CreatePolicyPayload {
  name: string;
  branchId: string;
  birthDate: string;
  duration: number;
  buildingPrice: number;
  occupationTypeId: string;
}

export interface CreateOccupationTypePayload {
  code: string;
  name: string;
  premiumRate: number;
}

export interface UpdateOccupationTypePayload {
  code?: string;
  name?: string;
  premiumRate?: number;
}
