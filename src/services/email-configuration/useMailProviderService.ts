import { useApiClient } from '@/composables/useApiClient'
import type { CreateEmailConfigurationDto, EmailConfigurationResponseDto,UpdateEmailConfigurationDto } from '@/services/email-configuration/emailConfigurationTypes'

export const useMailProviderService = () => {
  const privateApi = useApiClient(true)

  const getEmailConfigurations = async () => {
    return privateApi.get<EmailConfigurationResponseDto[]>('/email-configurations')
  }

  const createEmailConfiguration = async (data: CreateEmailConfigurationDto) => {
    return privateApi.post<EmailConfigurationResponseDto>('/email-configurations', data)
  }

  const updateEmailConfiguration = async (id:string, data: UpdateEmailConfigurationDto) => {
    return privateApi.patch<EmailConfigurationResponseDto>(`/email-configurations/${id}`, data)
  }

  const deleteEmailConfiguration = async (id:string) => {
    return privateApi.delete<void>(`/email-configurations/${id}`)
  }

  return {
    getEmailConfigurations,
    createEmailConfiguration,
    updateEmailConfiguration,
    deleteEmailConfiguration,
  }
}
