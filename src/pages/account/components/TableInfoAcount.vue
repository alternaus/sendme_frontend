<script lang="ts">
import { defineComponent, onMounted, type PropType, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import DateIcon from '@/assets/svg/date.svg?component'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppTag from '@/components/atoms/tag/AppTag.vue'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IRecharge } from '@/services/organization/interfaces/recharge.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

import { useRechargesFilter } from '../composables/useRechargesFilter'
import { RechargeStatus } from './enums/status-recharge-types.enum'

export default defineComponent({
  components: {
    AppTable,
    AppDatePicker,
    AppTag,
    DateIcon,
  },
  props: {
    idOrganization: {
      type: Number as PropType<number | undefined>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const { getRecharges } = useOrganizationService()
    const { startDate, endDate } = useRechargesFilter()

    const optionSelected = ref('1')
    const limit = ref(10)
    const page = ref(1)
    const recharges = ref<IRecharge[]>([])
    const loading = ref(false)
    const rechargesMeta = ref<IPaginationMeta>({
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      limit: 10,
      totalPages: 0,
      totalRecords: 0,
    })

    watch([startDate, endDate], () => {
      fetchRecharges()
    })

    const fetchRecharges = async ({ pageSize = 1, limitSize = 10 } = {}) => {
      page.value = pageSize
      limit.value = limitSize
      loading.value = true
      try {
        const response = await getRecharges({
          page: page.value,
          limit: limit.value,
          organizationId: props.idOrganization,
          fromDate: startDate.value ? startDate.value.toISOString() : undefined,
          toDate: endDate.value ? endDate.value.toISOString() : undefined,
        })
        if (response) {
          rechargesMeta.value = response.meta
          recharges.value = response.data ?? []
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const toggleOption = (value: string) => {
      optionSelected.value = value
    }

    //Método para formatear moneda
    const formatCurrency = (amount: number, _currencyCode: string) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    }

    const getStatusTranslation = (status: string) => {
      switch (status) {
        case 'accepted':
          return t(RechargeStatus.accepted)
        case 'pending':
          return t(RechargeStatus.pending)
        case 'rejected':
          return t(RechargeStatus.rejected)
        default:
          return t(RechargeStatus[status as keyof typeof RechargeStatus] || status)
      }
    }

    onMounted(() => {
      fetchRecharges()
    })

    return {
      optionSelected,
      toggleOption,
      recharges,
      fetchRecharges,
      loading,
      rechargesMeta,
      formatCurrency,
      getStatusTranslation,
      startDate,
      endDate,
    }
  },
})
</script>

<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="flex gap-4">
        <div
          @click="toggleOption('1')"
          class="transition-colors cursor-pointer rounded-lg py-2 px-3 flex items-center gap-2 shadow-md font-medium text-md"
          :class="{
            'bg-[#FECE2F] text-black hover:bg-yellow-400 active:bg-yellow-500':
              optionSelected === '1',
            'bg-gray-300 text-gray-700 hover:bg-gray-400': optionSelected !== '1',
          }"
        >
          <small>{{ $t('general.movements') }}</small>
        </div>

        <!-- <div
          @click="toggleOption('2')"
          class="transition-colors cursor-pointer rounded-lg p-3 flex items-center gap-2 shadow-md font-medium text-md"
          :class="{
            'bg-[#FECE2F] text-black hover:bg-yellow-400 active:bg-yellow-500':
              optionSelected === '2',
            'bg-gray-300 text-gray-700 hover:bg-gray-400': optionSelected !== '2',
          }"
        >
          <small>{{ $t('general.history') }}</small>
        </div> -->
      </div>

      <div class="flex flex-col sm:flex-row gap-4">
        <AppDatePicker
          v-model="startDate"
          placeholder=""
          :label="$t('general.start_date')"
          class="w-full mt-3"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>
        <AppDatePicker
          v-model="endDate"
          placeholder=""
          :label="$t('general.end_date')"
          class="w-full mt-3"
        >
          <template #icon>
            <DateIcon class="w-4 h-4 dark:fill-white" />
          </template>
        </AppDatePicker>
      </div>
    </div>

    <AppTable
      class="w-full mt-4"
      :data="recharges"
      :headers="[
        { field: 'createdAt', header: $t('general.date') },
        { field: 'amount', header: $t('general.amount') },
        { field: 'messageCount', header: $t('general.messages_count') },
        { field: 'remainingMessages', header: $t('general.remaining_messages') },
        { field: 'status', header: $t('general.status') },
      ]"
      :pageSize="rechargesMeta.limit"
      :pageCurrent="rechargesMeta.currentPage"
      :totalItems="rechargesMeta.totalRecords"
      :multipleSelection="false"
      :loading="loading"
      :emptyMessage="'general.error_getting_recharges'"
      textTotalItems="general.recharges"
      :autoDetectDateFields="true"
      @page-change="fetchRecharges"
    >
      <template #custom-amount="{ data }">
        <div class="flex justify-center items-center">
          <small class="custom-text-small">
            {{ data.currencyCode }}
            {{ formatCurrency(data.amount, data.currencyCode) }}
          </small>
        </div>
      </template>
      <template #custom-status="{ data }">
        <div class="flex justify-center items-center">
          <AppTag :label="getStatusTranslation(data.status)" />
        </div>
      </template>
    </AppTable>
  </div>
</template>
