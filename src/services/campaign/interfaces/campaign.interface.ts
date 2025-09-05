export interface ICampaignRule {
  id: number;
  conditionType: string;
  value: string|number;
  campaignId: number;
  customFieldId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ICampaign {
  id: number;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  campaignRules: ICampaignRule[];
}
