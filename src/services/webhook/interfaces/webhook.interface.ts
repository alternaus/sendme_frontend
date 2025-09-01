export interface WebhookAuth {
  type: 'bearer' | 'basic' | 'api_key'
  token?: string
  username?: string
  password?: string
  headerName?: string
  apiKey?: string
}

export interface WebhookSigning {
  secret: string
  algorithm: 'sha256' | 'sha512'
  header: string
}

export interface WebhookRetries {
  maxAttempts: number
  backoffMs: number
  strategy: 'exponential' | 'linear'
}

export interface WebhookConfig {
  headers?: Record<string, string>
  auth?: WebhookAuth
  signing?: WebhookSigning
  retries?: WebhookRetries
}

export interface WebhookEvent {
  id: number
  key: string
  category: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  schema?: {
    type: 'object'
    properties: Record<string, {
      type: string
      description?: string
      example?: Record<string, unknown>
    }>
    required?: string[]
  }
  example?: Record<string, unknown>
}

export interface WebhookEndpointEvent {
  endpointId: number
  eventId: number
  createdAt: string
  event: WebhookEvent
}

export interface WebhookEndpoint {
  id: number
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  isActive: boolean
  organizationId: number
  config: WebhookConfig
  createdAt: string
  updatedAt: string
  endpointEvents: WebhookEndpointEvent[]
}

export interface CreateWebhookEndpointDto {
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  isActive?: boolean
  config?: WebhookConfig
  events: string[]
}

export interface UpdateWebhookEndpointDto {
  name?: string
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  isActive?: boolean
  config?: WebhookConfig
  events?: string[]
}
