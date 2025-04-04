import type { IPlan } from './plan.interface';
export interface IOrganization {
  id:           number;
  name:         string;
  domain:       null;
  document:     null;
  documentType: null;
  email:        null;
  country:      string;
  city:         null;
  address:      null;
  phone:        string;
  apiKey:       string;
  createdAt:    Date;
  updatedAt:    Date;
  deletedAt:    null;
  plan:        IPlan;
}