export interface ICreateCampaignRule {
  conditionType: string;
  value: string|number;
  customFieldId: number;
}

export interface ICreateCampaign {
  name: string;
  description: string;
  content: string;
  contentType: 'PLAIN_TEXT' | 'HTML';
  status: 'ACTIVE' | 'INACTIVE';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  days: string[];
  startDate: string;
  endDate: string;
  time: string;
  rrule: string;
  channelId: number;
  organizationId: number;
  campaignRules: ICreateCampaignRule[];
}
