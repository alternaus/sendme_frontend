export interface IGenerateSmsRequest {
  context: string
  type: 'sms' | 'email'
}

export interface IGenerateSmsResponse {
  generatedText: string
}
