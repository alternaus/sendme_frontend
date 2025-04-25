<script lang="ts">
import { defineComponent, ref } from 'vue'

import Chart from 'primevue/chart'

import { useHead } from '@unhead/vue'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'

export default defineComponent({
  components: {
    AppCard,
    AppTable,
    AppHeader,
    Chart,
  },
  setup() {
    useHead({
      title: 'Home',
    })

    const statsData = {
      campaigns: 100,
      contacts: 10000,
      availableMessages: 100000,
      availableMoney: 1000,
      receivedMessages: 100000,
      rejectedMessages: 100000,
    }

    const campaignData = [
      { campaign: 'Cumpleaños', number: '321 3331922', message: 'Lorem ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the...' },
      { campaign: 'Cumpleaños', number: '321 3331922', message: 'Lorem ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the...' },
      { campaign: 'Cumpleaños', number: '321 3331922', message: 'Lorem ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the...' },
      { campaign: 'Cumpleaños', number: '321 3331922', message: 'Lorem ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the...' },
      { campaign: 'Cumpleaños', number: '321 3331922', message: 'Lorem ipsum is simply dummy text of the Lorem Ipsum is simply dummy text of the...' },
    ]

    const tableHeaders = [
      { field: 'campaign', header: 'Campaña' },
      { field: 'number', header: 'Número' },
      { field: 'message', header: 'Mensaje' },
    ]

    const chartData = ref({
      labels: ['Recibidos', 'Rechazados'],
      datasets: [
        {
          data: [statsData.receivedMessages, statsData.rejectedMessages],
          backgroundColor: ['var(--p-primary-color)', '#000000'],
          hoverBackgroundColor: ['var(--p-primary-color)', '#262626'],
        },
      ],
    })

    const chartOptions = ref({
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: 'var(--text-color)',
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
    })

    return {
      IconTypes,
      statsData,
      campaignData,
      tableHeaders,
      chartData,
      chartOptions,
    }
  },
})
</script>

<template>

  <AppHeader :icon="IconTypes.CONTACTS" />

  <div class="p-2 md:p-4 mx-auto">
    <!-- Header con saludo -->
    <AppCard class="mb-2">
      <template #content>
        <div class="flex justify-between items-center py-1">
          <h1 class="text-sm md:text-base">Hola, Marie from the boring company</h1>
        </div>
      </template>
    </AppCard>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-bullhorn text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">Campañas</span>
            </div>
            <span class="text-sm md:text-base font-bold">{{ statsData.campaigns }}</span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-users text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">Contactos</span>
            </div>
            <span class="text-sm md:text-base font-bold">{{ statsData.contacts }}</span>
          </div>
        </template>
      </AppCard>

      <AppCard class="sm:col-span-2 lg:col-span-1">
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-comment text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">Disponibles</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm md:text-base font-bold">{{ statsData.availableMessages }}</span>
              <span class="text-sm md:text-base font-bold">U${{ statsData.availableMoney }}</span>
            </div>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Chart and Table Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard class="h-[300px]">
        <template #content>
          <div class="flex flex-row items-center gap-4 h-full">
            <div class="w-full flex-2">
              <Chart type="doughnut" :data="chartData" :options="chartOptions" />
            </div>
            <div class="grid grid-rows-2 gap-4 w-full flex-1">
              <div class="p-2 rounded text-center bg-[var(--p-primary-color)]">
                <span class="text-xs md:text-sm font-bold block text-[var(--p-button-primary-color)]">Recibidos</span>
                <div class="text-sm md:text-base text-[var(--p-button-primary-color)]">{{ statsData.receivedMessages }}</div>
              </div>
              <div class="bg-black text-white p-2 rounded text-center">
                <span class="text-xs md:text-sm font-bold block">Rechazados</span>
                <div class="text-sm md:text-base">{{ statsData.rejectedMessages }}</div>
              </div>
            </div>
          </div>
        </template>
      </AppCard>

      <AppCard class="h-[300px] overflow-hidden">
        <template #content>
          <div class="h-full overflow-hidden">
            <AppTable
              :data="campaignData"
              :headers="tableHeaders"
              :pageSize="10"
              :pageCurrent="1"
              :totalItems="campaignData.length"
              :showPaginator="false"
              class="h-full"
            />
          </div>
        </template>
      </AppCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.fas {
  @apply text-neutral-700 dark:text-white;
}

:deep(.p-chart) {
  width: 100% !important;
  height: 100% !important;
}
</style>
