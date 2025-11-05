import { useApiClient } from '@/composables/useApiClient'

import type {
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
  WebhookEndpoint,
  WebhookEvent
} from './interfaces/webhook.interface'

export const useWebhookService = () => {
  const apiClient = useApiClient(true)

  const listWebhooks = async (): Promise<WebhookEndpoint[]> => {
    return apiClient.get<WebhookEndpoint[]>('/webhook-endpoints')
  }

  const createWebhook = async (data: CreateWebhookEndpointDto): Promise<WebhookEndpoint> => {
    return apiClient.post<WebhookEndpoint, CreateWebhookEndpointDto>('/webhook-endpoints', data)
  }

  const updateWebhook = async (id: string, data: UpdateWebhookEndpointDto): Promise<WebhookEndpoint> => {
    return apiClient.put<WebhookEndpoint, UpdateWebhookEndpointDto>(`/webhook-endpoints/${id}`, data)
  }

  const deleteWebhook = async (id: string): Promise<void> => {
    await apiClient.delete(`/webhook-endpoint/${id}`)
  }

  const toggleWebhookStatus = async (id: string, isActive: boolean): Promise<WebhookEndpoint> => {
    return apiClient.patch<WebhookEndpoint, { isActive: boolean }>(`/webhook-endpoints/${id}`, { isActive })
  }

  const listWebhookEvents = async (): Promise<WebhookEvent[]> => {
    return apiClient.get<WebhookEvent[]>('/webhook-events')
  }

  return {
    listWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    toggleWebhookStatus,
    listWebhookEvents
  }
}
