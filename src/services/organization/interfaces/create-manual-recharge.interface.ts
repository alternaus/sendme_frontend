export interface ICreateManualRecharge {
  organizationId: string
  amount: number
  messageCount: number
  notes?: string
  currencyCode?: string
}
