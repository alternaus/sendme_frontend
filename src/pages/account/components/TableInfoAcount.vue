<script lang="ts">
import { defineComponent, onMounted, type PropType, ref, watch } from 'vue'

import DateIcon from '@/assets/svg/date.svg?component'
import AppDatePicker from '@/components/atoms/datepickers/AppDatePicker.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import type { IPaginationMeta } from '@/services/interfaces/pagination-response.interface'
import type { IRecharge } from '@/services/organization/interfaces/recharge.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

import { useRechargesFilter } from '../composables/useRechargesFilter'
export default defineComponent({
  components: {
    AppTable,
    AppDatePicker,
    DateIcon,
  },
  props: {
    idOrganization: {
      type: Number as PropType<number | undefined>,
      required: true,
    },
  },
  setup(props) {
    const { getRecharges } = useOrganizationService()
    const { startDate, endDate } = useRechargesFilter()

    const limit = ref(10)
    const page = ref(1)
    const recharges = ref<IRecharge[]>([])
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
      try {
        const response = await getRecharges({
          page: page.value,
          limit: limit.value,
          organizationId: props.idOrganization,
          fromDate: startDate.value ? startDate.value.toISOString() : null,
          toDate: endDate.value ? endDate.value.toISOString() : null,
        })
        if (response) {
          rechargesMeta.value = response.meta
          recharges.value = response.data ?? []
        }
      } catch (error) {
        console.error('Error fetching recharges:', error)
      }
    }

    onMounted(() => {
      fetchRecharges()
    })
    return {
      recharges,
      rechargesMeta,
      fetchRecharges,
      startDate,
      endDate,
    }
  },
})
</script>
<template>
  <div>
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        opciones 
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
        { field: 'createdAt', header: 'Date' },
        { field: 'amount', header: 'Amount' },
        { field: 'messageCount', header: 'messageCount' },
        { field: 'remainingMessages', header: 'remainingMessages' },
        { field: 'status', header: 'Status' },
      ]"
      :pageSize="rechargesMeta.limit"
      :pageCurrent="rechargesMeta.currentPage"
      :totalItems="rechargesMeta.totalRecords"
      :multipleSelection="false"
      textTotalItems="general.recharges"
      @page-change="fetchRecharges"
    >
    </AppTable>
  </div>
</template>
