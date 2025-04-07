<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'

import ActionIcon from '@/assets/svg/action.svg?component'
import ChangeIcon from '@/assets/svg/change.svg?component'
import DateIcon from '@/assets/svg/date.svg?component'
import ModuleIcon from '@/assets/svg/module.svg?component'
import UserIcon from '@/assets/svg/user.svg?component'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { ActionTypes } from '@/components/molecules/header/enums/action-types.enum'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import CardFilterAudit from '@/pages/reports/pages/audit/components/CardFilterAudit.vue'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IAudit } from '@/services/report/interfaces/audit.interface'
import { useReportService } from '@/services/report/useReportServices'

import DialogChangesAudit from './components/DialogChangesAudit.vue'
import { useAuditFilter } from './composables/useAuditFilter'
import { ActionAuditTypes } from './enums/action-types.enum.ts'
import { ModuleTypes } from './enums/module-types.enum'
export default defineComponent({
  components: {
    AppHeader,
    AppTable,
    DateIcon,
    UserIcon,
    ActionIcon,
    ModuleIcon,
    ChangeIcon,
    CardFilterAudit,
    DialogChangesAudit,
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    const { getAudits, exportAudits } = useReportService()

    const { action, table, startDate, endDate, search } = useAuditFilter()

    const dataChanges = ref<Record<string, unknown>>({})
    const isDialogVisible = ref(false)
    const page = ref(1)
    const limit = ref(10)
    const audits = ref<IAudit[]>([])
    const auditMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })

    watch([startDate, endDate, action, table], () => {
      fetchAudits()
    })

    const fetchAudits = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      try {
        const response = await getAudits({
          page: page.value,
          limit: limit.value,
          action: action.value,
          table: table.value,
          startDate: startDate.value?.toISOString(),
          endDate: endDate.value?.toISOString(),
          // search: search.value,
        })
        if (response?.data && response?.meta) {
          audits.value = response.data
          auditMeta.value = response.meta
        } else {
          console.warn('⚠️ Respuesta no válida:', response)
        }
      } catch (error) {
        console.error('Error fetching audits:', error)
      }
    }

    const handleViewChanges = (rowData: IAudit) => {
      if (rowData.changes) {
        dataChanges.value = rowData.changes
        isDialogVisible.value = true // Muestra el modal
      }
    }

    const headerActions = computed(() => [
      {
        label: t('actions.export'),
        type: ActionTypes.EXPORT,
        onClick: () => {
          exportAudits({
            action: action.value,
            table: table.value,
            startDate: startDate.value?.toISOString(),
            endDate: endDate.value?.toISOString(),
            page: page.value,
            limit: limit.value,
          })
        },
      },
    ])

    onMounted(() => fetchAudits())
    const formatDate = (isoString: string) => {
      const date = new Date(isoString)
      return new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date)
    }

    const getActionTranslation = (action: string) => {
      const translationKey = ActionAuditTypes[action as keyof typeof ActionAuditTypes]
      return translationKey ? t(translationKey) : action
    }
    const getModuleTranslation = (module: string) => {
      const translationKey = ModuleTypes[module as keyof typeof ModuleTypes]
      return translationKey ? t(translationKey) : module
    }

    const startDateString = computed({
      get: () => startDate.value?.toISOString() || '',
      set: (value: string) => {
        startDate.value = value ? new Date(value) : new Date()
      }
    })

    const endDateString = computed({
      get: () => endDate.value?.toISOString() || '',
      set: (value: string) => {
        endDate.value = value ? new Date(value) : new Date()
      }
    })

    return {
      router,
      IconTypes,
      search,
      auditMeta,
      audits,
      fetchAudits,
      getActionTranslation,
      getModuleTranslation,
      headerActions,
      action,
      table,
      formatDate,
      dataChanges,
      handleViewChanges,
      isDialogVisible,
      startDateString,
      endDateString,
    }
  },
})
</script>
<template>
  <AppHeader :icon="IconTypes.AUDIT" :text="$t('report.audit')" :actions="headerActions" />
  <CardFilterAudit
    v-model:action="action"
    v-model:table="table"
    v-model:startDate="startDateString"
    v-model:endDate="endDateString"
    v-model:search="search"
  />
  <DialogChangesAudit
    :changesData="dataChanges"
    :visible="isDialogVisible"
    @update:visible="isDialogVisible = $event"
  />
  <AppTable
    class="w-full mt-4"
    :data="audits"
    :headers="[
      { field: 'createdAt', header: 'Date' },
      { field: 'userId', header: 'User' },
      { field: 'table', header: 'Module' },
      { field: 'changes', header: 'Changes' },
      { field: 'action', header: 'Action' },
    ]"
    :pageSize="auditMeta.limit"
    :pageCurrent="auditMeta.currentPage"
    :totalItems="auditMeta.totalRecords"
    :multipleSelection="false"
    textTotalItems="report.audits"
    @page-change="fetchAudits"
  >
    <template #header-createdAt>
      <div class="flex items-center">
        <DateIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.date') }} </span>
      </div>
    </template>
    <template #header-userId>
      <div class="flex items-center">
        <UserIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('user.user') }} </span>
      </div>
    </template>
    <template #header-table>
      <div class="flex items-center">
        <ModuleIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.module') }} </span>
      </div>
    </template>
    <template #header-changes>
      <div class="flex items-center">
        <ChangeIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.changes') }} </span>
      </div>
    </template>
    <template #header-action>
      <div class="flex items-center">
        <ActionIcon class="w-5 h-5 mr-2 fill-current" />
        <span> {{ $t('general.action') }} </span>
      </div>
    </template>
    <template #custom-createdAt="{ data }">
      <div class="flex justify-center items-center">
        <small class="custom-text-small">
          {{ formatDate(data.createdAt) }}
        </small>
      </div>
    </template>
    <template #custom-table="{ data }">
      <div class="flex justify-center">
        {{ getModuleTranslation(data.table) }}
      </div>
    </template>
    <template #custom-changes="{ data }">
      <div class="flex justify-center">
        <div
          v-if="data.changes"
          class="flex items-center justify-center w-8 h-8 rounded-full border-gray-400 border"
          @click="handleViewChanges(data)"
        >
          <i class="pi pi-eye"></i>
        </div>
        <small v-else>--</small>
      </div>
    </template>
    <template #custom-action="{ data }">
      <div class="flex justify-center">
        {{ getActionTranslation(data.action) }}
      </div>
    </template>
  </AppTable>
</template>
