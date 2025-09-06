import type { CampaignStatus } from "../enums/campaign-status.enum";

export interface IFilterCampaign {
  search?: string;
  name?: string;
  status?: CampaignStatus;
  startDate?: string;
  endDate?: string;
  channelId?:string;
  organizationId?:string;
  page?: number;
  limit?: number;
}
