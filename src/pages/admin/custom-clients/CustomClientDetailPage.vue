<template>
  <div class="p-6">
    <AppHeader :title="client?.name || $t('custom_clients.detail.title')" show-back @back="goBack" />

    <div v-if="loading" class="mt-6 text-center">
      <i class="pi pi-spin pi-spinner text-4xl text-gray-400"></i>
    </div>

    <div v-else-if="client" class="mt-6 space-y-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.organization_info') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.name') }}:</span> {{ client.name }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.document') }}:</span> {{ client.document }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.email') }}:</span> {{ client.email }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.phone') }}:</span> {{ client.phone }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.country') }}:</span> {{ client.country }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.city') }}:</span> {{ client.city }}</div>
          <div class="col-span-2"><span class="font-medium">{{ $t('custom_clients.detail.fields.address') }}:</span> {{ client.address }}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.plan_info') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.plan_name') }}:</span> {{ client.plan.name }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.subscription_price') }}:</span> {{ formatCurrency(client.plan.subscriptionPrice) }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.included_messages') }}:</span> {{ client.plan.includedMessages }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.message_price') }}:</span> {{ formatCurrency(client.plan.messagePrice) }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.reset_day') }}:</span> {{ client.plan.resetDay }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.campaign_limit') }}:</span> {{ client.plan.campaignLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.contact_limit') }}:</span> {{ client.plan.contactLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.tag_limit') }}:</span> {{ client.plan.tagLimit }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.custom_field_limit') }}:</span> {{ client.plan.customFieldLimit }}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.subscription_info') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.status') }}:</span> <span :class="getStatusClass(client.subscription.status)">{{ $t(`custom_clients.list.status.${client.subscription.status}`) }}</span></div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.start_date') }}:</span> <FormattedDate :date="client.subscription.startDate" format="date" /></div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.next_billing') }}:</span> <FormattedDate :date="client.subscription.nextBillingDate" format="date" /></div>
          <div v-if="client.subscription.cancelledAt"><span class="font-medium">{{ $t('custom_clients.detail.fields.cancelled_at') }}:</span> <FormattedDate :date="client.subscription.cancelledAt" format="date" /></div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.recharge_info') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.current_messages') }}:</span> {{ client.recharge.currentMessages }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.last_reset') }}:</span> <FormattedDate :date="client.recharge.lastResetDate" format="date" /></div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.next_reset') }}:</span> <FormattedDate :date="client.recharge.nextResetDate" format="date" /></div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">{{ $t('custom_clients.detail.managers') }}</h3>
        <DataTable :value="client.managers">
          <Column :header="$t('custom_clients.detail.fields.manager_name')" field="name" />
          <Column :header="$t('custom_clients.detail.fields.manager_email')" field="email" />
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

import FormattedDate from '@/components/atoms/formatted-date/FormattedDate.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import type { ICustomClient } from '@/services/custom-client/interfaces/custom-client.interface'
import { useCustomClientService } from '@/services/custom-client/useCustomClientService'

const route = useRoute()
const router = useRouter()
const { getCustomClient } = useCustomClientService()

const client = ref<ICustomClient>()
const loading = ref(false)

const loadClient = async () => {
  loading.value = true
  try {
    client.value = await getCustomClient(route.params.id as string)
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push({ name: 'custom-clients.index' })
const formatCurrency = (value: number) => `$${value.toLocaleString()}`

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'px-2 py-1 text-xs rounded bg-green-100 text-green-800',
    suspended: 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800',
    cancelled: 'px-2 py-1 text-xs rounded bg-red-100 text-red-800'
  }
  return classes[status] || classes.active
}

onMounted(() => loadClient())
</script>
