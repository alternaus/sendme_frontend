export interface IAudit {
  id:             number;
  action:         string;
  changes:        null;
  correlationId:  string;
  path:           string;
  recordId:       null;
  table:          string;
  timestamp:      Date;
  userId:         number;
  organizationId: number;
  ipAddress:      string;
  createdAt:      Date;
  updatedAt:      Date;
}