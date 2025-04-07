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
    const selected = ref<ICampaign | null>(null)
    const loading = ref(false)
    const campaignMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })

    const fetchCampaigns = async (
      { pageSize = 1, limitSize = campaignMeta.value.limit || 10 } = {
        pageSize: 1,
        limitSize: 10,
      }
    ) => {
      page.value = pageSize
      limit.value = limitSize
      loading.value = true

      try {
        const response = await getCampaigns({
          page: page.value,
          limit: limit.value,
          name: search.value,
        })
        if (response && response.data && response.meta) {
          campaigns.value = response.data
          campaignMeta.value = response.meta
        } else {
          console.warn('🔄 Respuesta no válida:', response)
        }
      } catch (error) {
        console.error('❌ Error al obtener campañas:', error)
        toast.add({
          severity: 'error',
          summary: t('general.error'),
          detail: t('campaign.error_getting_campaigns'),
        })
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCampaigns({ pageSize: 1, limitSize: 10 })
    })

    watch(search, () => {
      fetchCampaigns({ pageSize: 1, limitSize: 10 })
    })

    const handleSelectionChange = (selectedRow: ICampaign) => {
      selected.value = selectedRow
    }

    const handleDelete = async () => {
      if (!selected.value) return

      try {
        await deleteCampaign(selected.value.id)
        selected.value = null
        toast.add({
          severity: 'success',
          summary: t('general.success'),
          detail: t('campaign.success_removed'),
          life: 3000,
        })
        await fetchCampaigns({ pageSize: page.value, limitSize: limit.value })
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
      ...(selected.value
        ? [
            { label: t('actions.delete'), onClick: handleDelete, type: ActionTypes.DELETE },
            {
              label: t('actions.edit'),
              onClick: () => {
                if (selected.value?.id) {
                  push(`/campaigns/edit/${selected.value?.id}`)
                }
              },
              type: ActionTypes.EDIT,
            },
          ]
        : []),

    ])

    return {
      push,
      campaigns,
      selected,
      handleSelectionChange,
      handleDelete,
      fetchCampaigns,
      ActionTypes,
      IconTypes,
      campaignMeta,
      headerActions,
      search,
      loading,
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
    :pageSize="campaignMeta.limit"
    :pageCurrent="campaignMeta.currentPage"
    :totalItems="campaignMeta.totalRecords"
    :multipleSelection="false"
    :loading="loading"
    :emptyMessage="'campaign.error_getting_campaigns'"
    textTotalItems="campaign.campaigns"
    @selection-change="handleSelectionChange"
    @page-change="({ pageSize }) => fetchCampaigns({ pageSize, limitSize: campaignMeta.limit })"
  >
    <template #custom-channelName="{ data }">
      <div>{{ data.channel?.name || '-' }}</div>
    </template>
    <template #custom-frequency="{ data }">
      <div>
        <template v-if="data.days && data.days.length">
          {{ data.days.map((day: string) => $t(`campaign.days_abbr.${day}`)).join(', ') }} {{ data.time }}
        </template>
        <template v-else>-</template>
      </div>
    </template>
    <template #custom-status="{ data }">
      <div class="flex justify-center">
        <AppTag :label="data.status === 'active' ? $t('general.active') : $t('general.inactive')" />
      </div>
    </template>
  </AppTable>
</template>
<style lang="scss"></style>
