export interface IGenerateSmsRequest {
  context: string
  type: 'SMS' | 'EMAIL'
}

export interface IGenerateSmsResponse {
  generatedText: string
}
