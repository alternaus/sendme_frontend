import type { CampaignFrequency } from "../enums/campaign-frequency.enum";
import type { CampaignStatus } from "../enums/campaign-status.enum";
import type { ContentType } from "../enums/content-type.enum";
import type { CampaignDays } from "../enums/days.enum";

export interface ICreateCampaignRule {
  conditionType: string;
  value: string|number;
  customFieldId:string;
}

export interface ICreateCampaign {
  name: string;
  description: string;
  content: string;
  contentType: ContentType;
  status: CampaignStatus;
  frequency: CampaignFrequency;
  days: CampaignDays[];
  startDate: string;
  endDate: string;
  time: string;
  rrule: string;
  channelId:string;
  organizationId:string;
  campaignRules: ICreateCampaignRule[];
}
