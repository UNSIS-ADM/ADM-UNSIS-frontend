export interface AccessRestrictionDTO {
  id?: number | null;
  roleName: string; // "ROLE_APPLICANT"
  startDate: string; // "yyyy-MM-dd"
  endDate: string; // "yyyy-MM-dd"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  enabled: boolean;
  description?: string | null;
}
