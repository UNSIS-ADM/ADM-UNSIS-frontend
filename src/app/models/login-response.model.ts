export interface LoginResponse {
  token: string;
  username: string;
  id?: number;
  roles: string[];
  fullName?: string;
  curp?: string;
}
