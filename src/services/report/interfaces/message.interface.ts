export interface IMessage {
  id:string
  action: string
  changes: null
  correlationId: string
  path: string
  recordId: null
  table: string
  timestamp: Date
  userId:string
  organizationId:string
  createdAt: Date
  updatedAt: Date
}
