export interface AdminUser {
  id?: number;
  username: string;
  fullName: string;
  password?: string;
  confirmPassword?: string;
  roles: string[];
  active: boolean;
}
