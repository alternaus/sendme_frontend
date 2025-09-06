export interface IFilterUser {
  name?: string;
  email?: string;
  roleId?:string;
  organizationId?:string;
  page?: number;
  limit?: number;
}
