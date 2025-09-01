import { useForm } from 'vee-validate'
import * as yup from 'yup'

export interface WebhookForm {
  name: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  isActive: boolean
  authType: 'none' | 'bearer' | 'basic' | 'api_key'
  authToken?: string
  authUsername?: string
  authPassword?: string
  authHeaderName?: string
  authApiKey?: string
  signingSecret?: string
  signingAlgorithm: 'sha256' | 'sha512'
  signingHeader: string
  maxRetries: number
  retryBackoff: number
  retryStrategy: 'exponential' | 'linear'
  events: string[]
  customHeaders: Array<{ name: string; value: string }>
}

export const useWebhookForm = () => {
  const schema: yup.Schema<WebhookForm> = yup.object({
    name: yup.string().trim().min(3).max(100).required(),
    url: yup.string().url().required(),
    method: yup.string().oneOf(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).required(),
    isActive: yup.boolean().required(),
    authType: yup.string().oneOf(['none', 'bearer', 'basic', 'api_key']).required(),
    authToken: yup.string().when('authType', {
      is: 'bearer',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional()
    }),
    authUsername: yup.string().when('authType', {
      is: 'basic',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional()
    }),
    authPassword: yup.string().when('authType', {
      is: 'basic',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional()
    }),
    authHeaderName: yup.string().when('authType', {
      is: 'api_key',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional()
    }),
    authApiKey: yup.string().when('authType', {
      is: 'api_key',
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.optional()
    }),
    signingSecret: yup.string().optional(),
    signingAlgorithm: yup.string().oneOf(['sha256', 'sha512']).required(),
    signingHeader: yup.string().required(),
    maxRetries: yup.number().min(0).max(10).required(),
    retryBackoff: yup.number().min(1000).max(300000).required(),
    retryStrategy: yup.string().oneOf(['exponential', 'linear']).required(),
    events: yup.array().of(yup.string().required()).min(1).required(),
    customHeaders: yup.array().of(
      yup.object({
        name: yup.string().required(),
        value: yup.string().required()
      })
    ).required()
  })

  const { defineField, handleSubmit, setValues, resetForm, errors } = useForm<WebhookForm>({
    validationSchema: schema,
    initialValues: {
      name: '',
      url: '',
      method: 'POST',
      isActive: true,
      authType: 'none',
      authToken: '',
      authUsername: '',
      authPassword: '',
      authHeaderName: 'X-API-Key',
      authApiKey: '',
      signingSecret: '',
      signingAlgorithm: 'sha256',
      signingHeader: 'X-Webhook-Signature',
      maxRetries: 3,
      retryBackoff: 30000,
      retryStrategy: 'exponential',
      events: [],
      customHeaders: []
    }
  })

  const [name] = defineField('name')
  const [url] = defineField('url')
  const [method] = defineField('method')
  const [isActive] = defineField('isActive')
  const [authType] = defineField('authType')
  const [authToken] = defineField('authToken')
  const [authUsername] = defineField('authUsername')
  const [authPassword] = defineField('authPassword')
  const [authHeaderName] = defineField('authHeaderName')
  const [authApiKey] = defineField('authApiKey')
  const [signingSecret] = defineField('signingSecret')
  const [signingAlgorithm] = defineField('signingAlgorithm')
  const [signingHeader] = defineField('signingHeader')
  const [maxRetries] = defineField('maxRetries')
  const [retryBackoff] = defineField('retryBackoff')
  const [retryStrategy] = defineField('retryStrategy')
  const [events] = defineField('events')
  const [customHeaders] = defineField('customHeaders')

  return {
    form: {
      name,
      url,
      method,
      isActive,
      authType,
      authToken,
      authUsername,
      authPassword,
      authHeaderName,
      authApiKey,
      signingSecret,
      signingAlgorithm,
      signingHeader,
      maxRetries,
      retryBackoff,
      retryStrategy,
      events,
      customHeaders
    },
    handleSubmit,
    setValues,
    resetForm,
    errors
  }
}
