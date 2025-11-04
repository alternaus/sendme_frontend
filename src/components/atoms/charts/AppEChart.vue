<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDark, useResizeObserver } from '@vueuse/core'

import type { ComposeOption } from 'echarts'
import * as echarts from 'echarts'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption, RadarSeriesOption } from 'echarts/charts'
import type { GridComponentOption, LegendComponentOption, TitleComponentOption, ToolboxComponentOption } from 'echarts/components'
import { useI18n } from 'vue-i18n'

type ECOption = ComposeOption<
  | PieSeriesOption
  | LineSeriesOption
  | BarSeriesOption
  | RadarSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | ToolboxComponentOption
  | GridComponentOption
>

const props = defineProps<{
  option: ECOption | Record<string, unknown>
}>()

const isDark = useDark({ selector: 'html' })
const { locale } = useI18n()
const wrapperRef = ref<HTMLDivElement | null>(null)
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, isDark.value ? 'dark' : undefined)
}

function renderChart() {
  if (!chartInstance) initChart()
  if (!chartInstance) return
  chartInstance.setOption(props.option, { notMerge: true })
  chartInstance.resize()
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  renderChart()
})

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})

useResizeObserver(wrapperRef, () => resizeChart())

watch(() => props.option, () => nextTick(renderChart), { deep: true })
watch(isDark, () => {
  chartInstance?.dispose()
  chartInstance = null
  nextTick(() => { initChart(); renderChart() })
})
watch(locale, () => {
  chartInstance?.dispose()
  chartInstance = null
  nextTick(() => { initChart(); renderChart() })
})
</script>

<template>
  <div ref="wrapperRef" class="relative w-full h-full min-h-[320px]">
    <div ref="chartRef" class="absolute inset-0"></div>
  </div>
</template>

<style lang="scss" scoped>
:deep(canvas){
  border-radius: 1rem !important;
}
</style>
