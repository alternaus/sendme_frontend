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
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.subscription_price') }}:</span> {{ formatCurrency(client.plan.cost) }}</div>
          <div><span class="font-medium">{{ $t('custom_clients.detail.fields.message_price') }}:</span> {{ formatCurrency(client.plan.pricePerMessage) }}</div>
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import type { IOrganization } from '@/services/organization/interfaces/organization.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

const route = useRoute()
const router = useRouter()
const { getOrganization } = useOrganizationService()

const client = ref<IOrganization>()
const loading = ref(false)

const loadClient = async () => {
  loading.value = true
  try {
    client.value = await getOrganization(route.params.id as string)
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push({ name: 'custom-clients.index' })
const formatCurrency = (value: number) => `$${value.toLocaleString()}`

onMounted(() => loadClient())
</script>
