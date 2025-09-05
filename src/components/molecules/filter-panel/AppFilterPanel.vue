<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import Dialog from 'primevue/dialog'

import { useI18n } from 'vue-i18n'

import AppCard from '@/components/atoms/cards/AppCard.vue'

interface Props {
  showMobileModal?: boolean
}

interface Emits {
  'update:showMobileModal': [value: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  showMobileModal: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()
const showFilters = ref(true)

const isMobile = computed(() => window.innerWidth < 768)

const closeModal = () => {
  emit('update:showMobileModal', false)
}

// Detectar cambios en el tamaño de pantalla
const handleResize = () => {
  if (!isMobile.value && props.showMobileModal) {
    emit('update:showMobileModal', false)
  }
  if (!isMobile.value) {
    showFilters.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  // Configuración inicial
  if (isMobile.value) {
    showFilters.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <!-- Panel de filtros para desktop -->
    <div
      v-if="showFilters && !isMobile"
      class="transition-all duration-300 ease-in-out mb-4"
    >
      <AppCard>
        <template #content>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <slot />
          </div>
        </template>
      </AppCard>
    </div>

    <!-- Modal de filtros para móvil -->
    <Dialog
      :visible="showMobileModal"
      :modal="true"
      :dismissable-mask="true"
      :closable="true"
      :header="t('general.filters')"
      class="mx-4"
      :style="{ width: 'calc(100vw - 2rem)', maxWidth: '500px' }"
      position="center"
      @update:visible="closeModal"
    >
      <div class="space-y-4 pt-4">
        <slot />
      </div>
    </Dialog>
  </div>
</template><style scoped>
/* Asegurar que el modal se vea bien en móvil */
:deep(.p-dialog) {
  margin: 1rem;
}

:deep(.p-dialog-content) {
  padding: 1rem;
}

:deep(.p-dialog-header) {
  padding: 1rem 1rem 0.5rem 1rem;
}
</style>
