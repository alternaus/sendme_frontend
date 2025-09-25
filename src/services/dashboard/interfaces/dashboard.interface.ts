export interface PlanLimits {
  contactLimit: number
  campaignLimit: number
  tagLimit: number
  customFieldLimit: number
  pricePerMessage: number
}

export interface MessageStats {
  sent: number
  failed: number
  pending: number
  available: number
  used: number
  planTotal: number
  rechargeTotal: number
}

export interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  totalContacts: number
  messages: MessageStats
  planLimits: PlanLimits
}

export interface RecentMessage {
  id: string
  status: string
  createdAt: Date | string
  campaignName: string
  phone: string
  content: string
}

export interface DashboardResponse {
  stats: DashboardStats
  recentMessages: RecentMessage[]
}
