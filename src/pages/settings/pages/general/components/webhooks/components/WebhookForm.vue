<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import AppDialog from '@/components/atoms/dialogs/AppDialog.vue'
import AppInput from '@/components/atoms/inputs/AppInput.vue'
import AppSelect from '@/components/atoms/selects/AppSelect.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import type { CreateWebhookEndpointDto, WebhookEvent } from '@/services/webhook/interfaces/webhook.interface'
import { useWebhookService } from '@/services/webhook/useWebhookService'

import { useWebhookForm } from '../composables/useWebhookForm'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: CreateWebhookEndpointDto): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const { form, handleSubmit, resetForm, errors } = useWebhookForm()
const { getEvents } = useWebhookService()

const newHeader = ref({ name: '', value: '' })
const availableEvents = ref<WebhookEvent[]>([])
const loadingEvents = ref(false)
const isSchemaDialogVisible = ref(false)
const selectedEvent = ref<WebhookEvent | null>(null)

const methodOptions = [
  { name: 'GET', value: 'GET' },
  { name: 'POST', value: 'POST' },
]

const authTypeOptions = [
  { name: t('webhooks.auth_none'), value: 'none' },
  { name: t('webhooks.auth_bearer'), value: 'bearer' },
  { name: t('webhooks.auth_basic'), value: 'basic' },
  { name: t('webhooks.auth_api_key'), value: 'api_key' }
]

const signingAlgorithmOptions = [
  { name: 'SHA-256', value: 'sha256' },
  { name: 'SHA-512', value: 'sha512' }
]

const maxRetriesOptions = [
  { name: t('webhooks.no_retries'), value: 0 },
  { name: '1 ' + t('webhooks.attempt'), value: 1 },
  { name: '2 ' + t('webhooks.attempts'), value: 2 },
  { name: '3 ' + t('webhooks.attempts'), value: 3 },
  { name: '5 ' + t('webhooks.attempts'), value: 5 },
  { name: '10 ' + t('webhooks.attempts'), value: 10 }
]

const timeoutOptions = [
  { name: '5 ' + t('webhooks.seconds'), value: 5000 },
  { name: '10 ' + t('webhooks.seconds'), value: 10000 },
  { name: '30 ' + t('webhooks.seconds'), value: 30000 },
  { name: '60 ' + t('webhooks.seconds'), value: 60000 },
  { name: '120 ' + t('webhooks.seconds'), value: 120000 }
]

const loadEvents = async () => {
  loadingEvents.value = true
  try {
    availableEvents.value = await getEvents()
  } catch {
    availableEvents.value = [
    ]
  } finally {
    loadingEvents.value = false
  }
}

// Cargar eventos al montar el componente
onMounted(() => {
  loadEvents()
})

// Computed para validaciones
const isFormValid = computed(() => {
  return !errors.value.name && !errors.value.url && !errors.value.method &&
         form.name.value && form.url.value && form.method.value &&
         form.events.value.length > 0
})

// Métodos para manejar headers personalizados
const addHeader = () => {
  if (newHeader.value.name && newHeader.value.value) {
    form.customHeaders.value.push({ ...newHeader.value })
    newHeader.value = { name: '', value: '' }
  }
}

const removeHeader = (index: number) => {
  form.customHeaders.value.splice(index, 1)
}

// Métodos para manejar eventos
const toggleEvent = (eventKey: string) => {
  const index = form.events.value.indexOf(eventKey)
  if (index > -1) {
    form.events.value.splice(index, 1)
  } else {
    form.events.value.push(eventKey)
  }
}

const isEventSelected = (eventKey: string) => {
  return form.events.value.includes(eventKey)
}

// Métodos para manejar el formulario
const onSubmit = handleSubmit(async (values) => {
  // Construir la configuración del webhook
  const config: Record<string, unknown> = {}

  // Headers personalizados
  if (values.customHeaders.length > 0) {
    config.headers = values.customHeaders.reduce((acc, header) => {
      acc[header.name] = header.value
      return acc
    }, {} as Record<string, string>)
  }

  // Autenticación
  if (values.authType !== 'none') {
    const auth: Record<string, string> = { type: values.authType }

    switch (values.authType) {
      case 'bearer':
        if (values.authToken) auth.token = values.authToken
        break
      case 'basic':
        if (values.authUsername) auth.username = values.authUsername
        if (values.authPassword) auth.password = values.authPassword
        break
      case 'api_key':
        if (values.authHeaderName) auth.headerName = values.authHeaderName
        if (values.authApiKey) auth.apiKey = values.authApiKey
        break
    }
    config.auth = auth
  }

  // Firma
  if (values.signingSecret) {
    config.signing = {
      secret: values.signingSecret,
      algorithm: values.signingAlgorithm,
      header: values.signingHeader
    }
  }

  // Reintentos
  config.retries = {
    maxAttempts: values.maxRetries,
    backoffMs: values.retryBackoff,
    strategy: values.retryStrategy
  }

  const webhookData = {
    name: values.name,
    url: values.url,
    method: values.method,
    isActive: values.isActive,
    config,
    events: values.events
  }

  emit('submit', webhookData)
})

const openSchemaDialog = (event: WebhookEvent) => {
  selectedEvent.value = event
  isSchemaDialogVisible.value = true
}

const closeSchemaDialog = () => {
  isSchemaDialogVisible.value = false
  selectedEvent.value = null
}

const onCancel = () => {
  resetForm()
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <!-- Sección: Información Básica del Webhook -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-link text-primary"></i>
        {{ $t('webhooks.basic_information') }}
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Nombre del Webhook -->
        <div class="space-y-1 lg:col-span-2">
          <AppInput
            v-model="form.name.value"
            :error-message="errors.name"
            :placeholder="$t('webhooks.name_placeholder')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.name_description') }}
          </p>
        </div>

        <!-- Método HTTP -->
        <div class="space-y-1">
          <AppSelect
            v-model="form.method.value"
            :options="methodOptions"
            :error-message="errors.method"
            :placeholder="$t('webhooks.http_method')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.http_method_description') }}
          </p>
        </div>

        <!-- URL del Endpoint -->
        <div class="space-y-1">
          <AppInput
            v-model="form.url.value"
            :error-message="errors.url"
            :placeholder="$t('webhooks.url_placeholder')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.url_description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sección: Autenticación -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-shield text-primary"></i>
        {{ $t('webhooks.authentication') }}
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Tipo de Autenticación -->
        <div class="space-y-1">
          <AppSelect
            v-model="form.authType.value"
            :options="authTypeOptions"
            :placeholder="$t('webhooks.auth_type')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.auth_type_description') }}
          </p>
        </div>

        <!-- Campos de autenticación dinámicos -->
        <div class="space-y-1">
          <div v-if="form.authType.value === 'bearer'">
            <AppInput
              v-model="form.authToken.value"
              :error-message="errors.authToken"
              :placeholder="$t('webhooks.bearer_token_placeholder')"
              type="password"
            />
            <p class="text-xs text-neutral-600 dark:text-neutral-400">
              {{ $t('webhooks.bearer_token_description') }}
            </p>
          </div>

          <div v-else-if="form.authType.value === 'basic'" class="space-y-2">
            <div class="flex gap-2">
              <div class="flex-1">
                <AppInput
                  v-model="form.authUsername.value"
                  :error-message="errors.authUsername"
                  :placeholder="$t('webhooks.username_placeholder')"
                />
              </div>
              <div class="flex-1">
                <AppInput
                  v-model="form.authPassword.value"
                  :error-message="errors.authPassword"
                  :placeholder="$t('webhooks.password_placeholder')"
                  type="password"
                />
              </div>
            </div>
            <p class="text-xs text-neutral-600 dark:text-neutral-400">
              {{ $t('webhooks.basic_auth_description') }}
            </p>
          </div>

          <div v-else-if="form.authType.value === 'api_key'" class="space-y-2">
            <div class="flex gap-2">
              <div class="flex-1">
                <AppInput
                  v-model="form.authHeaderName.value"
                  :error-message="errors.authHeaderName"
                  :placeholder="$t('webhooks.header_name_placeholder')"
                />
              </div>
              <div class="flex-1">
                <AppInput
                  v-model="form.authApiKey.value"
                  :error-message="errors.authApiKey"
                  :placeholder="$t('webhooks.api_key_placeholder')"
                  type="password"
                />
              </div>
            </div>
            <p class="text-xs text-neutral-600 dark:text-neutral-400">
              {{ $t('webhooks.api_key_description') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección: Headers Personalizados -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-cog text-primary"></i>
        {{ $t('webhooks.custom_headers') }}
      </h3>

      <div class="space-y-3">
        <!-- Headers existentes -->
        <div v-if="form.customHeaders.value.length > 0" class="space-y-2">
          <div v-for="(header, index) in form.customHeaders.value" :key="index"
               class="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-w-0 flex-1">
              {{ header.name }}: {{ header.value }}
            </span>
            <button
              type="button"
              @click="removeHeader(index)"
              class="p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            >
              <i class="pi pi-trash text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Agregar nuevo header -->
        <div class="flex items-end gap-2">
          <div class="flex-1">
            <AppInput
            class="w-full"
              v-model="newHeader.name"
              :placeholder="$t('webhooks.header_name_placeholder')"
            />
          </div>
          <div class="flex-1">
            <AppInput
              class="w-full"
              v-model="newHeader.value"
              :placeholder="$t('webhooks.header_value_placeholder')"
            />
          </div>
          <AppButton
            type="button"
            :label="$t('webhooks.add_header')"
            icon="pi pi-plus"
            size="small"
            @click="addHeader"
            class="!w-auto"
            :disabled="!newHeader.name || !newHeader.value"
          />
        </div>
      </div>
    </div>

    <!-- Sección: Eventos -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-bell text-primary"></i>
        {{ $t('webhooks.events_that_trigger') }}
      </h3>

      <div v-if="loadingEvents" class="text-center py-8">
        <div class="text-neutral-500">{{ $t('webhooks.loading_events') }}</div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="event in availableEvents"
          :key="event.key"
          class="relative group"
        >
          <button
            type="button"
            @click="toggleEvent(event.key)"
            :class="[
              'w-full p-4 rounded-lg border-2 transition-all text-left min-h-[80px]',
              isEventSelected(event.key)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            ]"
          >
            <div class="font-medium text-sm mb-2">{{ event.key }}</div>
            <div class="text-xs text-neutral-600 dark:text-neutral-400">
              {{ event.description }}
            </div>
            <div v-if="event.schema" class="text-xs text-neutral-500 mt-2">
              <button
                type="button"
                @click.stop="openSchemaDialog(event)"
                class="flex items-center gap-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
              >
                <i class="pi pi-eye mr-1"></i>
                {{ $t('webhooks.view_schema') }}
              </button>
            </div>
          </button>


        </div>
      </div>

      <p class="text-xs text-neutral-600 dark:text-neutral-400">
        {{ $t('webhooks.events_description') }}
      </p>
    </div>

    <!-- Sección: Reintentos y Timeout -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-clock text-primary"></i>
        {{ $t('webhooks.retry_timeout') }}
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Intentos de Reintento -->
        <div class="space-y-1">
          <AppSelect
            v-model="form.maxRetries.value"
            :options="maxRetriesOptions"
            :placeholder="$t('webhooks.retry_attempts')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.retry_attempts_description') }}
          </p>
        </div>

        <!-- Timeout -->
        <div class="space-y-1">
          <AppSelect
            v-model="form.retryBackoff.value"
            :options="timeoutOptions"
            :placeholder="$t('webhooks.timeout_seconds')"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.timeout_description') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sección: Firma (Opcional) -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
        <i class="pi pi-lock text-primary"></i>
        {{ $t('webhooks.signing') }}
        <AppTag value="Opcional" severity="info" class="!py-0.5 !px-2 !text-xs" />
      </h3>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Secreto de Firma -->
        <div class="space-y-1 lg:col-span-2">
          <AppInput
            v-model="form.signingSecret.value"
            :placeholder="$t('webhooks.signing_secret_placeholder')"
            type="password"
          />
          <p class="text-xs text-neutral-600 dark:text-neutral-400">
            {{ $t('webhooks.signing_secret_description') }}
          </p>
        </div>

        <!-- Algoritmo -->
        <div class="space-y-1">
          <AppSelect
            v-model="form.signingAlgorithm.value"
            :options="signingAlgorithmOptions"
            :placeholder="$t('webhooks.signing_algorithm')"
          />
        </div>
      </div>

      <div class="space-y-1">
        <AppInput
          v-model="form.signingHeader.value"
          :placeholder="$t('webhooks.signing_header_placeholder')"
        />
        <p class="text-xs text-neutral-600 dark:text-neutral-400">
          {{ $t('webhooks.signing_header_description') }}
        </p>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
      <AppButton
        type="submit"
        class="!w-auto"
        :disabled="props.loading || !isFormValid"
        severity="primary"
        :label="props.loading ? $t('webhooks.creating') : $t('webhooks.create_webhook')"
      />

      <AppButton
        type="button"
        outlined
        class="!w-auto"
        severity="secondary"
        :disabled="props.loading"
        :label="$t('webhooks.cancel')"
        @click="onCancel"
      />
    </div>
  </form>

    <!-- Dialog del Schema -->
  <AppDialog
    v-model:modelValue="isSchemaDialogVisible"
    modal
    :header="selectedEvent ? `${$t('webhooks.event_schema')}: ${selectedEvent.key}` : $t('webhooks.event_schema')"
    :style="{ width: '90vw', maxWidth: '800px' }"
    :draggable="false"
  >
    <div v-if="selectedEvent?.schema" class="space-y-4">
      <!-- Propiedades del Schema -->
      <div>
        <h4 class="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
          {{ $t('webhooks.schema_properties') }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="(prop, propName) in selectedEvent.schema.properties"
            :key="propName"
            class="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {{ propName }}
                </span>
                <span v-if="selectedEvent.schema.required?.includes(propName)"
                      class="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">
                  {{ $t('webhooks.required') }}
                </span>
              </div>
              <div class="text-sm text-neutral-600 dark:text-neutral-400">
                <span class="font-medium">{{ $t('webhooks.type') }}:</span> {{ prop.type }}
              </div>
              <div v-if="prop.description" class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {{ prop.description }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ejemplo del Schema -->
      <div v-if="selectedEvent.example">
        <h4 class="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
          {{ $t('webhooks.example') }}
        </h4>
        <div class="bg-neutral-900 dark:bg-neutral-100 p-4 rounded-lg">
          <pre class="text-neutral-100 dark:text-neutral-900 text-sm overflow-x-auto">{{ JSON.stringify(selectedEvent.example, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <AppButton
        :label="$t('webhooks.close')"
        @click="closeSchemaDialog"
        outlined
        severity="secondary"
      />
    </div>
  </AppDialog>
</template>
