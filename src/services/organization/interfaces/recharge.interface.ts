import type { RechargeStatus } from './filter-recharge.interface'

export interface IRecharge {
  id: string
  paymentId?: string
  organizationId: string
  currencyCode: string
  amount: number
  messageCount: number
  remainingAmount: number
  remainingMessages: number
  status: RechargeStatus
  notes: string | null
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  deletedAt: string | null
}
