export const ROLE_CODES = {
  ADMIN: 'ADMIN',
  PHARMACIST: 'PHARMACIST',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES];

export const DEFAULT_ROLES: ReadonlyArray<{ code: RoleCode; name: string; description: string }> = [
  { code: ROLE_CODES.ADMIN, name: 'Administrador', description: 'Administración general de MediFind' },
  { code: ROLE_CODES.PHARMACIST, name: 'Farmacéutico', description: 'Gestión de una farmacia asignada' },
  { code: ROLE_CODES.CUSTOMER, name: 'Cliente', description: 'Usuario registrado de MediFind' },
];
