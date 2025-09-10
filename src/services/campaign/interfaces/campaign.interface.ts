import type { ITag } from '../../tag/interfaces'
import type { CampaignConditionType } from '../enums/campaign-condition-type.enum'
import type { CampaignFrequency } from '../enums/campaign-frequency.enum'
import type { CampaignStatus } from '../enums/campaign-status.enum'
import type { ContentType } from '../enums/content-type.enum'
import type { CampaignDays } from '../enums/days.enum'

export interface ICampaignRule {
  id: string
  conditionType: CampaignConditionType
  value: string | number
  campaignId: string
  customFieldId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ICampaign {
  id: string
  name: string
  description: string
  content: string
  contentType: ContentType
  status: CampaignStatus
  frequency: CampaignFrequency
  days: CampaignDays[]
  startDate: string
  endDate: string
  time: string
  rrule: string
  channelId: string
  organizationId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  campaignRules: ICampaignRule[]
  tags?: ITag[]
}
