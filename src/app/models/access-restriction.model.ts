export interface AccessRestriction {
  id: number | null;
  roleName: string | null;
  startDate: string | null; // yyyy-MM-dd
  endDate: string | null;
  startTime: string | null; // HH:mm
  endTime: string | null;
  enabled: boolean | null;
  description: string | null;
}
