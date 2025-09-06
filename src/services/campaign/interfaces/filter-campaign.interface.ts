export interface IFilterCampaign {
  search?: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'FINISHED';
  startDate?: string;
  endDate?: string;
  channelId?:string;
  organizationId?:string;
  page?: number;
  limit?: number;
}
