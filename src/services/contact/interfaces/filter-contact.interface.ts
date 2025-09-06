import type { ContactOrigin } from "../enums/contact-origin.enum"

export interface IFilterContact {
  search?: string
  name?: string
  countryCode?: string
  status?: string
  origin?: ContactOrigin
  page?: number
  limit?: number
}
