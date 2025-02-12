export interface ICustomField {
  id: number
  fieldName: string
  elementType: string
  dataType: string
  options: Record<string, unknown>[] | null
  organizationId: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
