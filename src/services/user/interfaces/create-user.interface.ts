export interface ICreateUser {
  roleId: number;
  organizationId: number;
  name: string;
  email: string;
  password: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string;
}
