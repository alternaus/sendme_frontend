<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDark } from '@vueuse/core'

import { useHead } from '@unhead/vue'
import type { ComposeOption } from 'echarts'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption, RadarSeriesOption } from 'echarts/charts'
import type { GridComponentOption, LegendComponentOption, TitleComponentOption, ToolboxComponentOption } from 'echarts/components'
import { useI18n } from 'vue-i18n'

import AppSelectButton from '@/components/atoms/buttons/AppSelectButton.vue'
import AppCard from '@/components/atoms/cards/AppCard.vue'
import AppEChart from '@/components/atoms/charts/AppEChart.vue'
import AppDataView from '@/components/atoms/data-view/AppDataView.vue'
import AppHtmlViewerDialog from '@/components/atoms/dialogs/AppHtmlViewerDialog.vue'
import AppHeader from '@/components/molecules/header/AppHeader.vue'
import type { DashboardResponse } from '@/services/dashboard/interfaces/dashboard.interface'
import { useDashboardService } from '@/services/dashboard/useDashboardService'
import { useAuthStore } from '@/stores/useAuthStore'

type ECOption = ComposeOption<
  | PieSeriesOption | LineSeriesOption | BarSeriesOption | RadarSeriesOption
  | TitleComponentOption | LegendComponentOption | ToolboxComponentOption | GridComponentOption
>

const { t } = useI18n()
const authStore = useAuthStore()
const isDark = useDark()
useHead({ title: t('titles.home') })

const { getDashboardData } = useDashboardService()
const dashboardData = ref<DashboardResponse | null>(null)
const loading = ref(true)

const primary = ref<string>(''); const surface300 = ref<string>(''); const surface500 = ref<string>(''); const surface700 = ref<string>('')
onMounted(() => {
  const cs = getComputedStyle(document.documentElement)
  primary.value   = cs.getPropertyValue('--p-primary-color').trim()
  surface300.value= cs.getPropertyValue('--p-surface-300').trim()
  surface500.value= cs.getPropertyValue('--p-surface-500').trim()
  surface700.value= cs.getPropertyValue('--p-surface-700').trim()
})

/** Datos comunes */
const labels = computed(() => [t('home.sent'), t('home.pending'), t('home.failed'), t('home.available')])
const values = computed(() => [
  dashboardData.value?.stats.sentMessages ?? 0,
  dashboardData.value?.stats.pendingMessages ?? 0,
  dashboardData.value?.stats.failedMessages ?? 0,
  dashboardData.value?.stats.availableMessages ?? 0
])
const colors = computed(() => [primary.value, surface300.value, surface700.value, surface500.value])

/** Builder único */
function buildOption(
  type: 'pie'|'line'|'bar'|'radar',
  dark: boolean,
  labels: string[],
  vals: number[],
  colors: string[]
): ECOption {
  const text = { color: dark ? '#fff' : '#000' }
  const toolbox: ToolboxComponentOption = {
    show: true, feature: { dataView: { show: true, readOnly: false }, restore: { show: true }, saveAsImage: { show: true } }
  }
  const legend: LegendComponentOption = { left: 'center', top: 'bottom', textStyle: text }
  const base: Partial<ECOption> = { title: { left: 'center', textStyle: text }, legend, tooltip: {}, toolbox, color: colors }

  if (type === 'pie') {
    return {
      ...base,
      tooltip: { trigger: 'item', formatter: '{b} : {c} ({d}%)' },
      series: [{
        name: t('home.messages'),
        type: 'pie',
        radius: [20, 140],
        center: ['50%','50%'],
        roseType: 'radius',
        itemStyle: { borderRadius: 5 },
        label: { show: false },
        emphasis: { label: { show: true } },
        data: labels.map((name, i) => ({ name, value: vals[i] ?? 0 }))
      }]
    }
  }

  if (type === 'line' || type === 'bar') {
    return {
      ...base,
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: labels, axisLabel: text },
      yAxis: { type: 'value', axisLabel: text },
      series: [{
        name: t('home.messages'),
        type,
        data: vals,
        smooth: type === 'line',
        lineStyle: type === 'line' ? { width: 3 } : undefined,
        itemStyle: { borderRadius: 5 }
      }]
    }
  }

  // radar
  const max = Math.max(1, ...vals)
  return {
    ...base,
    tooltip: { trigger: 'item' },
    radar: {
      indicator: labels.map(n => ({ name: n, max })),
      axisName: text,
      splitLine: { lineStyle: { color: dark ? '#333' : '#ddd' } },
      splitArea: { show: false }
    },
    series: [{
      name: t('home.messages'),
      type: 'radar',
      data: [{ value: vals, name: t('home.messages'), areaStyle: { color: colors[0], opacity: 0.3 } }]
    }]
  }
}

/** Tipo global para TODAS las gráficas */
const globalChartType = ref<'pie'|'line'|'bar'|'radar'>('pie')

/** Opciones para el select button de gráficas */
const chartOptions = [
  { name: t('home.pie_chart'), value: 'pie', icon: 'pi pi-chart-pie' },
  { name: t('home.line_chart'), value: 'line', icon: 'pi pi-chart-line' },
  { name: t('home.bar_chart'), value: 'bar', icon: 'pi pi-chart-bar' },
  { name: t('home.radar_chart'), value: 'radar', icon: 'pi pi-chart-scatter' }
]

/** Opciones reactivas (reúsalas en tantas <AppEChart> como quieras) */
const mainChartOption = computed(() =>
  buildOption(globalChartType.value, isDark.value, labels.value, values.value, colors.value) as Record<string, unknown>
)

const loadDashboardData = async () => {
  loading.value = true
  try {
    const res = await getDashboardData()
    dashboardData.value = res ?? null
  } finally {
    loading.value = false
  }
}
onMounted(loadDashboardData)


const showContentModal = ref(false)
const selectedMessageContent = ref('')
const openContentModal = (content: string) => { selectedMessageContent.value = content; showContentModal.value = true }
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

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
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
              <i class="pi pi-clock text-xs md:text-sm"></i>
              <span class="text-xs md:text-sm text-neutral-700 dark:text-white">
                {{ t('home.pendingMessages') }}
              </span>
            </div>
            <span class="text-sm md:text-base font-bold">
              {{ dashboardData?.stats.pendingMessages || 0 }}
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

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[320px]">
      <AppCard class="flex flex-col h-full">
        <template #content>
          <div class="flex-1 h-full flex flex-col">
            <div class="flex justify-end mb-2">
              <AppSelectButton
                v-model="globalChartType"
                :options="chartOptions"
                container-class="w-auto"
                select-button-class="flex gap-1"
                size="small"
              >
                <template #option="{ option }">
                  <i :class="option.icon" class="text-sm"></i>
                </template>
              </AppSelectButton>
            </div>
            <div class="flex-1">
              <AppEChart :option="mainChartOption" />
            </div>
          </div>
        </template>
      </AppCard>

      <AppCard class="flex flex-col">
        <template #content>
          <div class="flex-1 min-h-0 flex flex-col">
            <h3 class="text-base font-semibold mb-2 text-neutral-700 dark:text-white">
              {{ t('home.recentMessages') }}
            </h3>
            <div class="flex-1 min-h-0 overflow-y-auto">
              <AppDataView :data="dashboardData?.recentMessages || []"
                @view-content="(content: string) => openContentModal(content)" />
            </div>
          </div>
        </template>
      </AppCard>
    </div>


    <AppHtmlViewerDialog v-model:visible="showContentModal" :html-content="selectedMessageContent" />
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
