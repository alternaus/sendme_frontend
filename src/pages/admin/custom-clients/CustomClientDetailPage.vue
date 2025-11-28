<template>
  <div class="p-6">
    <AppHeader
      :title="client?.organization.name || $t('custom_clients.detail.title')"
      show-back
      @back="goBack"
      :actions="headerActions"
    />

    <div v-if="loading" class="mt-6 text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
    </div>

    <div v-else-if="client" class="mt-6 space-y-6">
      <!-- Organization Info -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">{{ $t('custom_clients.detail.organization_info') }}</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.name') }}:</span> {{ client.organization.name }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.document') }}:</span> {{ client.organization.document }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.email') }}:</span> {{ client.organization.email }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.phone') }}:</span> {{ client.organization.phone }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.country') }}:</span> {{ client.organization.country }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.city') }}:</span> {{ client.organization.city }}</div>
          <div class="md:col-span-2"><span class="font-medium">{{ $t('custom_clients.detail.fields.address') }}:</span> {{ client.organization.address }}</div>
        </div>
      </div>

      <!-- Plan Info -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.plan_info') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.plan_name') }}:</span> {{ client.plan.planName }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.subscription_price') }}:</span> {{ formatCurrency(client.plan.subscriptionPrice) }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.message_price') }}:</span> {{ formatCurrency(client.plan.messagePrice) }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.included_messages') }}:</span> {{ client.plan.includedMessages }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.reset_day') }}:</span> {{ client.plan.resetDay }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.campaign_limit') }}:</span> {{ client.plan.campaignLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.contact_limit') }}:</span> {{ client.plan.contactLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.tag_limit') }}:</span> {{ client.plan.tagLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.custom_field_limit') }}:</span> {{ client.plan.customFieldLimit }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import type { IClientDetailsResponse } from '@/services/organization/interfaces/client-details.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const { getClientDetails } = useOrganizationService()

const client = ref<IClientDetailsResponse>()
const loading = ref(false)

const loadClient = async () => {
  loading.value = true
  try {
    client.value = await getClientDetails(route.params.id as string)
  } catch {
    toast.add({ severity: 'error', summary: t('common.general.error'), detail: t('custom_clients.messages.load_error'), life: 3000 })
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push({ name: 'custom-clients.index' })
const formatCurrency = (value: number) => `$${value?.toLocaleString() ?? 0}`

const headerActions = computed(() => {
  return [
    {
      type: ActionTypes.EDIT,
      label: t('common.general.edit'),
      onClick: () => router.push({ name: 'custom-clients.edit', params: { id: route.params.id } })
    }
  ]
})

onMounted(() => loadClient())
</script>
