export interface IFilterCampaign {
  search?: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'FINISHED';
  startDate?: string;
  endDate?: string;
  channelId?: number;
  organizationId?: number;
  page?: number;
  limit?: number;
}
