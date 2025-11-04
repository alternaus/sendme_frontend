export interface ICustomField {
  id:string
  fieldName: string
  elementType: string
  dataType: string
  options: Record<string, unknown>[] | null
  organizationId:string
  isVisible: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
