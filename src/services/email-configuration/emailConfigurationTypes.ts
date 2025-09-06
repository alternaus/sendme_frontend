export interface CreateEmailConfigurationDto {
  name: string;
  host: string;
  port: number;
  secure?: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateEmailConfigurationDto {
  name?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  fromEmail?: string;
  fromName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface EmailConfigurationResponseDto {
  id:string;
  organizationId:string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromEmail: string;
  fromName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string; // o Date
  updatedAt: string; // o Date
}
