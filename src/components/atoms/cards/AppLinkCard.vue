<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Iconos de settings
import AdministratorsIcon from '@/assets/svg/administrators.svg?component'
import IntegrationsIcon from '@/assets/svg/integrations.svg?component'
// Iconos de reportes
import AuditIcon from '@/assets/svg/report/audit.svg?component'
import MessagesIcon from '@/assets/svg/report/messages.svg?component'
import SendingIcon from '@/assets/svg/report/sending.svg?component'
import InformationIcon from '@/assets/svg/table-actions/information.svg?component'
import { IconTypesReports } from '@/pages/reports/components/enums/icon-types-reports.enum'
import { IconTypesSettings } from '@/pages/settings/components/enums/icon-types-settings.enum'

interface Props {
  icon?: keyof typeof IconTypesReports | keyof typeof IconTypesSettings
  text: string
  to?: string | { name: string; params?: Record<string, string> }
  click?: () => void
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: IconTypesReports.MESSAGES,
  disabled: false,
  class: ''
})

const emit = defineEmits<{
  click: []
}>()

const router = useRouter()

// Mapa de iconos SVG - Reportes
const IconComponentsReports = {
  [IconTypesReports.MESSAGES]: MessagesIcon,
  [IconTypesReports.AUDIT]: AuditIcon,
  [IconTypesReports.SENDING]: SendingIcon,
}

// Mapa de iconos SVG - Settings
const IconComponentsSettings = {
  [IconTypesSettings.CUSTOM_FIELDS]: InformationIcon,
  [IconTypesSettings.USERS]: AdministratorsIcon,
  [IconTypesSettings.INTEGRATIONS]: IntegrationsIcon,
}

// Función para obtener el icono correcto
const getIconComponent = computed(() => {
  if (props.icon in IconComponentsReports) {
    return IconComponentsReports[props.icon as keyof typeof IconTypesReports]
  }
  if (props.icon in IconComponentsSettings) {
    return IconComponentsSettings[props.icon as keyof typeof IconTypesSettings]
  }
  return MessagesIcon // fallback
})

const cardClasses = computed(() => {
  const baseClasses = 'flex flex-col items-center justify-center w-64 sm:w-56 md:w-60 h-36 p-3 border rounded-2xl cursor-pointer transition-all duration-200 relative group'

  if (props.disabled) {
    return `${baseClasses} border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-50`
  }

  return `${baseClasses} border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-[var(--p-primary-color)] hover:shadow-lg hover:scale-105 active:scale-95`
})

const handleClick = () => {
  if (props.disabled) return

  if (props.click) {
    props.click()
    emit('click')
  } else if (props.to) {
    router.push(props.to)
    emit('click')
  }
}
</script>

<template>
  <div
    :class="cardClasses"
    @click="handleClick"
    role="button"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space="handleClick"
  >
    <!-- Icono SVG -->
    <component
      :is="getIconComponent"
      class="w-10 h-10 md:w-12 md:h-12 fill-neutral-800 dark:fill-neutral-300 group-hover:fill-[var(--p-primary-color)] group-hover:scale-110 transition-all"
    />

    <!-- Texto -->
    <small class="mt-2 text-center text-sm md:text-base text-neutral-800 font-semibold dark:text-neutral-300 group-hover:text-[var(--p-primary-color)] transition-colors">
      {{ text }}
    </small>

    <!-- Indicador de hover -->
    <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <i class="pi pi-arrow-right text-[var(--p-primary-color)] text-xs"></i>
    </div>
  </div>
</template>

<style scoped>
/* Asegurar que el componente sea accesible por teclado */
[role="button"]:focus {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}
</style>
