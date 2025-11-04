export enum RechargeStatus {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
  HELD = 'HELD',
  INITIATED = 'INITIATED',
  EXPIRED = 'EXPIRED',
  ABANDONED = 'ABANDONED',
  CANCELLED = 'CANCELLED',
}

export interface IFilterRecharge {
  status?: RechargeStatus
  organizationId?: string
  page?: number
  limit?: number
  toDate?: string
  fromDate?: string
}
