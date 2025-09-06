export interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  availableMessages: number
  sentMessages: number
  failedMessages: number
  pendingMessages: number
  totalContacts: number
}

export interface RecentMessage {
  id:string
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
