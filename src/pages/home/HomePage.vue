<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useDark } from '@vueuse/core'

import Chart from 'primevue/chart'

import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppTable from '@/components/atoms/tables/AppTable.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import type { DashboardResponse } from '@/services/dashboard/interfaces/dashboard.interface'
import { useDashboardService } from '@/services/dashboard/useDashboardService'
import { useAuthStore } from '@/stores/useAuthStore'

export default defineComponent({
  components: {
    AppCard,
    AppHeader,
    AppTable,
    Chart,
  },
  setup() {
    const { t } = useI18n()
    const authStore = useAuthStore()
    const isDark = useDark()
    useHead({
      title: t('titles.home'),
    })

    const { getDashboardData } = useDashboardService()
    const dashboardData = ref<DashboardResponse | null>(null)
    const loading = ref(true)

    const updateChartColors = (isDarkMode: boolean) => {
      chartData.value = {
        ...chartData.value,
        datasets: [{
          ...chartData.value.datasets[0],
          backgroundColor: [isDarkMode ? '#fed757' : '#fece2f', '#000000'],
          hoverBackgroundColor: [isDarkMode ? '#fed757' : '#fece2f', '#262626'],
        }]
      }
    }

    const chartData = ref({
      labels: [t('home.sent'), t('home.failed')],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: [isDark.value ? '#fed757' : '#fece2f', '#000000'],
          hoverBackgroundColor: [isDark.value ? '#fed757' : '#fece2f', '#262626'],
        },
      ],
    })

    const chartOptions = ref({
      type: 'pie',
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: isDark.value ? '#ffffff' : '#000000',
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: '0%',
    })

    const tableHeaders = [
      { field: 'campaignName', header: 'Campaña' },
      { field: 'phone', header: 'Número' },
      { field: 'content', header: 'Contenido' },
    ]

    const loadDashboardData = async () => {
      try {
        loading.value = true
        const response = await getDashboardData()
        if (response) {
          dashboardData.value = response

          // Actualizar datos del gráfico
          chartData.value = {
            labels: [t('home.sent'), t('home.failed')],
            datasets: [
              {
                data: [
                  response.stats.sentMessages || 0,
                  response.stats.failedMessages || 0
                ],
                backgroundColor: [isDark.value ? '#fed757' : '#fece2f', '#000000'],
                hoverBackgroundColor: [isDark.value ? '#fed757' : '#fece2f', '#262626'],
              },
            ],
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        loading.value = false
      }
    }

    // Observar cambios en el modo oscuro
    watch(isDark, (newValue) => {
      updateChartColors(newValue)
      chartOptions.value.plugins.legend.labels.color = newValue ? '#ffffff' : '#000000'
    })

    onMounted(() => {
      loadDashboardData()
    })

    return {
      IconTypes,
      chartData,
      chartOptions,
      tableHeaders,
      dashboardData,
      loading,
      t,
      authStore,
    }
  },
})
</script>

<template>

<AppHeader :showHeader="false" />

  <div class="p-2 md:p-4 mx-auto">
    <AppCard class="mb-2">
      <template #content>
        <div class="flex justify-between items-center">
          <p class="text-sm md:text-base">{{ t('home.welcome', { name: authStore.user?.name }) }}</p>
        </div>
      </template>
    </AppCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-bullhorn text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">{{ t('home.campaigns') }}</span>
            </div>
            <span class="text-sm md:text-base font-bold">{{ dashboardData?.stats.totalCampaigns || 0 }}</span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-users text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">{{ t('home.contacts') }}</span>
            </div>
            <span class="text-sm md:text-base font-bold">{{ dashboardData?.stats.totalContacts || 0 }}</span>
          </div>
        </template>
      </AppCard>

      <AppCard class="sm:col-span-2 lg:col-span-1">
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="fas fa-comment text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">{{ t('home.available') }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm md:text-base font-bold">{{ dashboardData?.stats.availableMessages || 0 }}</span>
            </div>
          </div>
        </template>
      </AppCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard class="h-[300px]">
        <template #content>
          <div class="flex flex-row items-center gap-4 h-full">
            <div class="w-full md:flex-2">
              <Chart type="pie" :data="chartData" :options="chartOptions" />
            </div>
            <div class="hidden md:grid grid-rows-2 gap-4 w-full flex-1">
              <div class="p-2 rounded text-center bg-[var(--p-primary-color)]">
                <span class="text-xs md:text-sm font-bold block text-[var(--p-button-primary-color)]">{{ t('home.sent') }}</span>
                <div class="text-sm md:text-base text-[var(--p-button-primary-color)]">{{
                  dashboardData?.stats.sentMessages || 0 }}</div>
              </div>
              <div class="bg-black text-white p-2 rounded text-center">
                <span class="text-xs md:text-sm font-bold block">{{ t('home.failed') }}</span>
                <div class="text-sm md:text-base">{{ dashboardData?.stats.failedMessages || 0 }}</div>
              </div>
            </div>
          </div>
        </template>
      </AppCard>

      <AppTable :data="dashboardData?.recentMessages || []" :headers="tableHeaders" :pageSize="10" :pageCurrent="1"
        :totalItems="(dashboardData?.recentMessages || []).length" :showPaginator="false" class="h-full" />
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
