export interface AccessRestriction {
  id?: number;
  roleName: string; // "ROLE_APPLICANT"
  startDate: string; // formato yyyy-MM-dd
  endDate: string;
  startTime: string; // formato HH:mm
  endTime: string;
  enabled: boolean;
  description?: string;
}
