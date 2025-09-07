<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

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

const isMobile = computed(() => window.innerWidth < 768)

const closeModal = () => {
  emit('update:showMobileModal', false)
}

// Detectar cambios en el tamaño de pantalla
const handleResize = () => {
  if (!isMobile.value && props.showMobileModal) {
    emit('update:showMobileModal', false)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div>
    <!-- Panel de filtros para desktop -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMobileModal && !isMobile"
        class="mb-4"
      >
        <AppCard>
          <template #content>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <slot />
            </div>
          </template>
        </AppCard>
      </div>
    </Transition>

    <!-- Modal de filtros para móvil -->
    <Dialog
      :visible="showMobileModal && isMobile"
      :modal="true"
      :dismissable-mask="true"
      :closable="true"
      :header="t('common.general.filters')"
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

/* Animaciones personalizadas para el modal */
@keyframes slide-in-from-bottom {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-out-to-bottom {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(100%);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* Animaciones para sincronizar con la tabla */
@keyframes slide-down {
  from {
    transform: translateY(-10px);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(10px);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Utilidades de animación para Tailwind */
.animate-in {
  animation-duration: 300ms;
  animation-fill-mode: both;
}

.animate-out {
  animation-duration: 200ms;
  animation-fill-mode: both;
}

.slide-in-from-bottom-4 {
  animation-name: slide-in-from-bottom;
}

.slide-out-to-bottom-4 {
  animation-name: slide-out-to-bottom;
}

.fade-in-0 {
  animation-name: fade-in;
}

.fade-out-0 {
  animation-name: fade-out;
}

/* Utilidades para animaciones de tabla */
.animate-slide-down {
  animation-name: slide-down;
  animation-duration: 300ms;
  animation-fill-mode: both;
}

.animate-slide-up {
  animation-name: slide-up;
  animation-duration: 300ms;
  animation-fill-mode: both;
}
</style>
