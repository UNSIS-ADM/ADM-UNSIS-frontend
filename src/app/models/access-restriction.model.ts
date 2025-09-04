export interface AccessRestriction {
  id: number | null;
  roleName: string | null;
  activationDate: string | null; // yyyy-MM-dd
  activationTime: string | null; // HH:mm
  enabled: boolean | null;
  description: string | null;
}
