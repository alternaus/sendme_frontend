export interface ISettingsPayload {
  dateFormat: string
  timeFormat: string
  timezone: string
}

export interface ISettingsResponse extends ISettingsPayload {
  id: number
  organizationId: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
