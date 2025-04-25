export interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  availableMessages: number
  sentMessages: number
  failedMessages: number
  totalContacts: number
}

export interface RecentMessage {
  id: number
  status: string
  createdAt: string
  campaignName: string
  phone: string
  content: string
}

export interface DashboardResponse {
  stats: DashboardStats
  recentMessages: RecentMessage[]
}
