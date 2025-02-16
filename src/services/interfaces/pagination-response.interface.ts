export interface IPaginationMeta {
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  limit: number
  totalPages: number
  totalRecords: number
}
export interface IPaginationResponse<T> {
  data: T[]
  meta: IPaginationMeta
}
