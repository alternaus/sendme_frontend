export interface ITestRule {
  conditionType: string
  value: string | number | number[]
  customFieldId:string
}

export interface ITestExecutions {
  startDate: string
  endDate: string
  time: string
  days: string[]
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
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

// Mantener compatibilidad con interfaces anteriores
export interface ITestRulesRequest {
  rules: ITestRule[]
}

export interface ITestRulesResponse {
  total: number
  selected: number
  percent: number
}
