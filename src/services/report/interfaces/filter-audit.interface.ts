export interface IFilterAudit {
  page: number
  limit: number
  action?: string
  correlationId?: string
  path?: string
  recordId?:string
  table?: string
  userId?:string
  startDate?: string
  endDate?: string
  search?: string
}
