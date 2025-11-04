export interface ISettingsPayload {
  dateFormat: string
  timeFormat: string
  timezone: string
}

export interface ISettingsResponse extends ISettingsPayload {
  id:string
  organizationId:string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
