<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDark, useResizeObserver } from '@vueuse/core'

import type { ComposeOption } from 'echarts'
import * as echarts from 'echarts'
import type { PieSeriesOption } from 'echarts/charts'
import type {
  LegendComponentOption,
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption} from 'echarts/components'

export type ECOption = ComposeOption<
  | PieSeriesOption
  | TitleComponentOption
  | LegendComponentOption
  | TooltipComponentOption
  | ToolboxComponentOption
>

const props = defineProps<{
  option: ECOption            // ⬅️ antes: echarts.EChartsOption
  height?: string
  width?: string
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const isDark = useDark({ selector: 'html' })

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, isDark.value ? 'dark' : undefined)
}

function renderChart() {
  if (!chartInstance) initChart()
  if (!chartInstance) return
  chartInstance.setOption(props.option, { notMerge: true })
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

useResizeObserver(chartRef, resizeChart)

watch(
  () => props.option,
  () => nextTick(renderChart),
  { deep: true }
)

watch(isDark, () => {
  chartInstance?.dispose()
  chartInstance = null
  nextTick(() => {
    initChart()
    renderChart()
  })
})
</script>

<template>
  <div :style="{ width: width || '100%', height: height || '320px' }" ref="chartRef"></div>
</template>
