export interface IFilterAudit {
  page: number
  limit: number
  action?: string
  correlationId?: string
  path?: string
  recordId?: number
  table?: string
  userId?: number
  startDate?: string
  endDate?: string
}
