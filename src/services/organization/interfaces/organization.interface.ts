export interface IOrganization {
  id:           number;
  name:         string;
  domain:       string;
  document:     string;
  documentType: string;
  country:      string;
  city:         string;
  address:      string;
  phone:        string;
  apiKey:       string;
  createdAt:    Date;
  updatedAt:    Date;
  deletedAt:    Date;
}