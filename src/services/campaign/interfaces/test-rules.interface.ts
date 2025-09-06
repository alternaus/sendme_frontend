import type { CampaignConditionType } from "../enums/campaign-condition-type.enum"
import type { CampaignFrequency } from "../enums/campaign-frequency.enum"

export interface ITestRule {
  conditionType: CampaignConditionType
  value: string | number | number[]
  customFieldId:string
}

export interface ITestExecutions {
  startDate: string
  endDate: string
  time: string
  days: string[]
  frequency: CampaignFrequency
  maxExecutions?: number
}

export interface ITestCampaignRequest {
  rules?: ITestRule[]
  executions?: ITestExecutions
}

export interface ITestRulesResult {
  total: number
  selected: number
  percent: number
}

export interface ITestExecutionsResult {
  rrule: string
  upcomingExecutions: string[]
}

export interface ITestCampaignResponse {
  rules?: ITestRulesResult
  executions?: ITestExecutionsResult
}

export interface ITestRulesRequest {
  rules: ITestRule[]
}

export interface ITestRulesResponse {
  total: number
  selected: number
  percent: number
}
