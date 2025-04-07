<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { ICampaign } from '@/services/campaign/interfaces/campaign.interface'
import { useCampaignService } from '@/services/campaign/useCampaignService'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'

export default defineComponent({
  components: {
    AppHeader,
    AppTable,
    AppTag,
  },
  setup() {
    const { t } = useI18n()
    const { push } = useRouter()
    const { getCampaigns, deleteCampaign } = useCampaignService()
    const toast = useToast()

    const page = ref(1)
    const limit = ref(10)
    const search = ref('')
    const campaigns = ref<ICampaign[]>([])
    const campaignsMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })
    const selectedCampaign = ref<ICampaign | null>(null)

    const fetchCampaigns = async (newPage = 1) => {
      page.value = newPage
      try {
        const response = await getCampaigns({
          page: page.value,
          limit: limit.value,
          name: search.value,
        })
        campaigns.value = response.data
        campaignsMeta.value = response.meta
      } catch (error) {
        console.error('❌ Error al obtener las campañas:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.error_getting_campaigns'),
          life: 3000,
        })
      }
    }

    onMounted(() => fetchCampaigns())

    watch(search, async () => {
      console.log('🔍 Buscando:', search.value)
      await fetchCampaigns(1)
    })

    const handleSelectionChange = (selectedRow: ICampaign) => {
      selectedCampaign.value = selectedRow
    }

    const handleDelete = async () => {
      if (!selectedCampaign.value) return

      try {
        await deleteCampaign(selectedCampaign.value.id)
        selectedCampaign.value = null
        toast.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: t('campaign.success_removed'),
          life: 3000,
        })
        await fetchCampaigns(page.value)
      } catch (error) {
        console.error('❌ Error al eliminar campaña:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.error_removed'),
          life: 3000,
        })
      }
    }

    const headerActions = computed(() => [
      {
        label: t('actions.create'),
        onClick: () => push('/campaigns/create'),
        type: ActionTypes.CREATE,
      },
      ...(selectedCampaign.value
        ? [
            { label: t('actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE },
            {
              label: t('actions.view'),
              onClick: () => {
                if (selectedCampaign.value?.id) {
                  push(`/campaigns/view/${selectedCampaign.value?.id}`)
                }
              },
              type: ActionTypes.VIEW,
            },
            {
              label: t('actions.edit'),
              onClick: () => {
                if (selectedCampaign.value?.id) {
                  push(`/campaigns/edit/${selectedCampaign.value?.id}`)
                }
              },
              type: ActionTypes.EDIT,
            },
          ]
        : []),
      {
        label: t('actions.export'),
        onClick: () => {},
        type: ActionTypes.EXPORT,
      },
      {
        label: t('actions.import'),
        onClick: () => {},
        type: ActionTypes.IMPORT,
      },
    ])

    return {
      push,
      campaigns,
      selectedCampaign,
      handleSelectionChange,
      handleDelete,
      fetchCampaigns,
      ActionTypes,
      IconTypes,
      campaignsMeta,
      headerActions,
      search,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.CAMPAIGNS" v-model="search" show-search :actions="headerActions" />
  <AppTable
    class="w-full mt-4"
    :data="campaigns"
    :headers="[
      { field: 'name', header: $t('campaign.name') },
      { field: 'frequency', header: $t('campaign.frequency') },
      { field: 'channelName', header: $t('campaign.channel') },
      { field: 'startDate', header: $t('campaign.start_date') },
      { field: 'endDate', header: $t('campaign.end_date') },
      { field: 'status', header: $t('campaign.status') },
    ]"
    :pageSize="campaignsMeta.limit"
    :pageCurrent="campaignsMeta.currentPage"
    :totalItems="campaignsMeta.totalRecords"
    :multipleSelection="false"
    textTotalItems="campaign.campaigns"
    @selection-change="handleSelectionChange"
    @page-change="fetchCampaigns"
  >
    <template #custom-channelName="{ data }">
      <div>{{ data.channel?.name || '-' }}</div>
    </template>
    <template #custom-frequency="{ data }">
      <div>{{ data.days.join(', ') }} {{ data.time }}</div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag :label="data.status === 'active' ? $t('general.active') : $t('general.inactive')" />
      </div>
    </template>
  </AppTable>
</template>
<style lang="scss"></style>
