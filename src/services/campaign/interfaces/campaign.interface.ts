export interface ICampaignRule {
  id:string;
  conditionType: string;
  value: string|number;
  campaignId:string;
  customFieldId:string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ICampaign {
  id:string;
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
  channelId:string;
  organizationId:string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  campaignRules: ICampaignRule[];
}
