export interface IFilterCampaign {
  name?: string;
  status?: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  channelId?: number;
  organizationId?: number;
  page?: number;
  limit?: number;
}
