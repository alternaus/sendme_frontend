import { useApiClient } from '@/composables/useApiClient'

import type { IGenerateSmsRequest, IGenerateSmsResponse } from './interfaces/generate-sms.interface'
import type { ITranslateRequest, ITranslateResponse } from './interfaces/translate.interface'

export const useAiService = () => {
  const privateApi = useApiClient(true)

  const generateSms = async (request: IGenerateSmsRequest): Promise<IGenerateSmsResponse> => {
    return privateApi.post<IGenerateSmsResponse, IGenerateSmsRequest>('/ai/generate-sms', request)
  }

  const translate = async (request: ITranslateRequest): Promise<ITranslateResponse> => {
    return privateApi.post<ITranslateResponse, ITranslateRequest>('/ai/translate', request)
  }

  return {
    generateSms,
    translate
  }
}
