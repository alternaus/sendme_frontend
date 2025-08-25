export interface ITranslateRequest {
  text: string
  targetLanguage: string
}

export interface ITranslateResponse {
  translatedText: string
  detectedLanguage?: string
  targetLanguage: string
}
