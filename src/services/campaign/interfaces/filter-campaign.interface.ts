export interface IFilterCampaign {
  search?: string;
  name?: string;
  status?: 'active' | 'inactive' | 'paused' | 'finished';
  startDate?: string;
  endDate?: string;
  channelId?: number;
  organizationId?: number;
  page?: number;
  limit?: number;
}
