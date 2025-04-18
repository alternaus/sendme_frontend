<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { IOrganization } from '@/services/organization/interfaces/organization.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'
import { useAuthStore } from '@/stores/useAuthStore'

import TableIInfoComponent from './components/TableInfoAcount.vue'
export default defineComponent({
  components: {
    AppHeader,
    AppCard,
    TableIInfoComponent,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const authStore = useAuthStore()
    const organizationId = authStore.user?.organizationId

    const { getOrganization } = useOrganizationService()
    const organization = ref<IOrganization | null>(null)
    const fetchOrganization = async () => {
      try {
        const response = await getOrganization(organizationId!)
        organization.value = response ?? null
      } catch (error) {
        console.error('Error fetching organization:', error)
      }
    }

    onMounted(() => {
      fetchOrganization()
    })

    return {
      router,
      IconTypes,
      t,
      organization,
      fetchOrganization,
      organizationId,
    }
  },
})
</script>
<template>
  <AppHeader :actions="[]" />
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <AppCard class="w-full mt-4" v-tooltip.bottom="$t('general.info_organization')">
      <template #content>
        <div class="flex flex-col">
          <small class="text-xl font-bold">{{ organization?.name }} </small>
          <small class="text-base"
            >{{ $t('general.address') }} : {{ organization?.address }}
          </small>
          <small class="text-base">{{ $t('general.city') }} : {{ organization?.city }} </small>
          <small class="text-base"
            >{{ $t('general.country') }} : {{ organization?.country }}
          </small>
          <small class="text-base">{{ $t('general.email') }} : {{ organization?.email }} </small>
          <small class="text-base">{{ $t('general.phone') }} : {{ organization?.phone }} </small>
        </div>
      </template>
    </AppCard>
    <AppCard class="w-full mt-4" v-tooltip.bottom="$t('general.info_plan')">
      <template #content>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <i class="pi pi-briefcase"></i>
            <small class="text-xl font-bold">
              {{ organization?.plan.name }}
            </small>
          </div>
          <small class="text-base">
            {{ $t('general.description') }} : {{ organization?.plan.description }}
          </small>
          <small class="text-base">
            {{ $t('general.contact_limit') }} : {{ organization?.plan.contactLimit }}
          </small>
          <small class="text-base">
            {{ $t('general.campaign_limit') }} : {{ organization?.plan.campaignLimit }}
          </small>
          <small class="text-base">
            {{ $t('general.price_per_message') }} : {{ organization?.plan.pricePerMessage }}
          </small>
          <small class="text-base">
            {{ $t('general.cost') }} : {{ organization?.plan.cost }}
          </small>
        </div>
      </template>
    </AppCard>
  </div>
  <TableIInfoComponent class="w-full mt-4" :idOrganization="organizationId" />
</template>
