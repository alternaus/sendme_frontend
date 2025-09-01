import { useApiClient } from '@/composables/useApiClient'

import type {
  CreateWebhookEndpointDto,
  UpdateWebhookEndpointDto,
  WebhookEndpoint,
  WebhookEvent
} from './interfaces/webhook.interface'

export const useWebhookService = () => {
  const apiClient = useApiClient(true)

  const list = async (): Promise<WebhookEndpoint[]> => {
    const response = await apiClient.get<WebhookEndpoint[]>('/webhook-endpoints')
    return response
  }

  const create = async (data: CreateWebhookEndpointDto): Promise<WebhookEndpoint> => {
    const response = await apiClient.post<WebhookEndpoint, CreateWebhookEndpointDto>('/webhook-endpoints', data)
    return response
  }

  const update = async (id: number, data: UpdateWebhookEndpointDto): Promise<WebhookEndpoint> => {
    const response = await apiClient.put<WebhookEndpoint, UpdateWebhookEndpointDto>(`/webhook-endpoints/${id}`, data)
    return response
  }

  const remove = async (id: number): Promise<void> => {
    await apiClient.delete(`/webhook-endpoint/${id}`)
  }

  const toggleStatus = async (id: number, isActive: boolean): Promise<WebhookEndpoint> => {
    const response = await apiClient.patch<WebhookEndpoint, { isActive: boolean }>(`/webhook-endpoints/${id}`, { isActive })
    return response
  }

  const getEvents = async (): Promise<WebhookEvent[]> => {
    const response = await apiClient.get<WebhookEvent[]>('/webhook-events')
    return response
  }

  return {
    list,
    create,
    update,
    remove,
    toggleStatus,
    getEvents
  }
}
