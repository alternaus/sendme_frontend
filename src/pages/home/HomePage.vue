<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDark } from '@vueuse/core'

import { useHead } from '@unhead/vue'
import type { ComposeOption } from 'echarts'
import type { PieSeriesOption } from 'echarts/charts'
import type {
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption
} from 'echarts/components'
import { useI18n } from 'vue-i18n'

import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppEChart from '@/components/atoms/charts/AppEChart.vue'
import AppDataView from '@/components/atoms/data-view/AppDataView.vue'
import AppHtmlViewerDialog from '@/components/atoms/dialogs/AppHtmlViewerDialog.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import type { DashboardResponse } from '@/services/dashboard/interfaces/dashboard.interface'
import { useDashboardService } from '@/services/dashboard/useDashboardService'
import { useAuthStore } from '@/stores/useAuthStore'
type ECOption = ComposeOption<
  | PieSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | ToolboxComponentOption
>

const { t } = useI18n()
const authStore = useAuthStore()
const isDark = useDark()
useHead({ title: t('titles.home') })

const { getDashboardData } = useDashboardService()
const dashboardData = ref<DashboardResponse | null>(null)
const loading = ref(true)

const primary = ref<string | undefined>('')
const surface500 = ref<string | undefined>('')
const surface700 = ref<string | undefined>('')

onMounted(() => {
  primary.value = getComputedStyle(document.documentElement).getPropertyValue('--p-primary-color')
  surface500.value = getComputedStyle(document.documentElement).getPropertyValue('--p-surface-500')
  surface700.value = getComputedStyle(document.documentElement).getPropertyValue('--p-surface-700')
})

const makeMessagesStatusChart = (dark: boolean, data: DashboardResponse | null): ECOption => ({
  title: {

    left: 'center',
    textStyle: { color: dark ? '#fff' : '#000' }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)'
  },
  legend: {
    left: 'center',
    top: 'bottom',
    textStyle: { color: dark ? '#fff' : '#000' }
  },
  toolbox: {
    show: true,
    feature: {
      dataView: { show: true, readOnly: false },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  color: [primary.value, surface700.value, surface500.value],
  series: [
    {
      name: t('home.messages'),
      type: 'pie',
      radius: [20, 140],
      center: ['50%', '50%'],
      roseType: 'radius',
      itemStyle: { borderRadius: 5 },
      label: { show: false },
      emphasis: { label: { show: true } },
      data: [
        {
          value: data?.stats.sentMessages || 0,
          name: t('home.sent')
        },
        {
          value: data?.stats.failedMessages || 0,
          name: t('home.failed')
        },
        {
          value: data?.stats.availableMessages || 0,
          name: t('home.available'),
        }
      ]
    }
  ]
})

const chartData = ref<ECOption>(makeMessagesStatusChart(isDark.value, null))



const loadDashboardData = async () => {
  try {
    loading.value = true
    const response = await getDashboardData()
    if (response) {
      dashboardData.value = response
      chartData.value = makeMessagesStatusChart(isDark.value, response)
    }
  } finally {
    loading.value = false
  }
}

watch(isDark, (v) => {
  chartData.value = makeMessagesStatusChart(v, dashboardData.value)
})


onMounted(loadDashboardData)

const showContentModal = ref(false)
const selectedMessageContent = ref('')

const openContentModal = (content: string, _type: 'text' | 'html') => {
  selectedMessageContent.value = content
  showContentModal.value = true
}

</script>

<template>
  <AppHeader :showHeader="false" />

  <div class="p-2 md:p-4 mx-auto">
    <AppCard class="mb-2">
      <template #content>
        <div class="flex justify-between items-center">
          <p class="text-sm md:text-base">
            {{ t('home.welcome', { name: authStore.user?.name }) }}
          </p>
        </div>
      </template>
    </AppCard>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-megaphone text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.totalCampaigns') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.totalCampaigns || 0 }}
            </span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-play-circle text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.activeCampaigns') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.activeCampaigns || 0 }}
            </span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-user text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.totalContacts') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.totalContacts || 0 }}
            </span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-comments text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.available') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.availableMessages || 0 }}
            </span>
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Métricas de mensajes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-check-circle text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.sentMessages') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.sentMessages || 0 }}
            </span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-exclamation-triangle text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.failedMessages') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.failedMessages || 0 }}
            </span>
          </div>
        </template>
      </AppCard>

      <AppCard>
        <template #content>
          <div class="flex items-center justify-between px-2 py-1">
            <div class="flex items-center gap-2">
              <i class="pi pi-pause-circle text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.available') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.availableMessages || 0 }}
            </span>
          </div>
        </template>
      </AppCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard class="min-h-[360px]">
        <template #content>
          <div class="h-[360px]">
            <AppEChart :option="chartData" height="100%" />
          </div>
        </template>
      </AppCard>

      <AppCard class="min-h-[360px]">
        <template #content>
          <div class="h-[360px]">
            <h3 class="text-lg font-semibold mb-4 text-neutral-700 dark:text-white">
              {{ t('home.recentMessages') }}
            </h3>
            <AppDataView
              :data="dashboardData?.recentMessages || []"
              @view-content="(content: string) => openContentModal(content, 'text')"
            />
          </div>
        </template>
      </AppCard>
    </div>

    <AppHtmlViewerDialog
      v-model:visible="showContentModal"
      :html-content="selectedMessageContent"
    />
  </div>
</template>

<style lang="scss" scoped>
.chart-container,
:deep(.p-chart),
:deep(.echarts) {
  width: 100%;
  height: 100%;
}
</style>
