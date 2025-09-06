export interface IUpdateCampaignRule {
  id?:string;
  conditionType?: string;
  value?: string|number;
  customFieldId?:string;
}

export interface IUpdateCampaign {
  name?: string;
  description?: string;
  content?: string;
  contentType?: 'PLAIN_TEXT' | 'HTML';
  status?: 'ACTIVE' | 'INACTIVE';
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  days?: string[];
  startDate?: string;
  endDate?: string;
  time?: string;
  rrule?: string;
  channelId?:string;
  organizationId?:string;
  campaignRules?: IUpdateCampaignRule[];
}
