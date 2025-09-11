<template>
  <Dialog
    v-model:visible="isModalVisible"
    modal
    :header="$t('terms.modal.title')"
    :style="{ width: '50rem' }"
    :maximizable="false"
    :closable="!blocking"
    :closeOnEscape="!blocking"
    :dismissableMask="false"
    class="terms-acceptance-dialog"
  >
    <div class="terms-modal-content">
      <!-- Contenido de términos -->
      <div class="terms-content mb-4">
        <h3 class="text-xl font-semibold mb-3">{{ $t('terms.content.title') }}</h3>
        <p class="text-gray-600 mb-4">{{ $t('terms.content.description') }}</p>

        <!-- Contenido de términos y condiciones en ScrollPanel -->
        <ScrollPanel style="width: 100%; height: 300px" class="terms-scroll-content">
          <div class="pr-3">
            <div class="terms-sections">
              <div class="mb-4">
                <h4 class="text-lg font-medium mb-2">{{ $t('terms.sections.privacy.title') }}</h4>
                <p class="text-gray-600 leading-relaxed">{{ $t('terms.sections.privacy.content') }}</p>
              </div>

              <div class="mb-4">
                <h4 class="text-lg font-medium mb-2">{{ $t('terms.sections.usage.title') }}</h4>
                <p class="text-gray-600 leading-relaxed">{{ $t('terms.sections.usage.content') }}</p>
              </div>

              <div class="mb-4">
                <h4 class="text-lg font-medium mb-2">{{ $t('terms.sections.data.title') }}</h4>
                <p class="text-gray-600 leading-relaxed">{{ $t('terms.sections.data.content') }}</p>
              </div>
            </div>
          </div>
        </ScrollPanel>
      </div>

      <!-- Aviso para modal bloqueante -->
      <Message
        v-if="blocking"
        severity="warn"
        :closable="false"
        class="mb-4"
      >
        {{ $t('terms.blocking.notice') }}
      </Message>
    </div>

    <!-- Botones del modal -->
    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          v-if="!blocking"
          :label="$t('terms.actions.cancel')"
          severity="secondary"
          outlined
          @click="handleCancel"
          :disabled="accepting"
        />

        <Button
          :label="accepting ? $t('terms.actions.accepting') : $t('terms.actions.accept')"
          :loading="accepting"
          @click="handleAccept"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ScrollPanel from 'primevue/scrollpanel'

import { useTermsStore } from '@/stores/termsStore'

interface Props {
  organizationId?: string
  termsVersion?: string
  blocking?: boolean
}

interface Emits {
  (e: 'accepted', data: unknown): void
  (e: 'cancelled'): void
  (e: 'error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  termsVersion: '1.0.0',
  blocking: false
})

const emit = defineEmits<Emits>()

const termsStore = useTermsStore()

const accepting = ref(false)

// Usar computed para manejar la visibilidad del modal
const isModalVisible = computed({
  get: () => termsStore.isModalVisible,
  set: (value: boolean) => {
    if (!value && !props.blocking) {
      termsStore.hideModal()
    }
  }
})

const currentOrganizationId = computed(() =>
  props.organizationId || termsStore.currentOrganizationId
)

const handleAccept = async () => {
  if (!currentOrganizationId.value) {
    emit('error', new Error('Organization ID is required'))
    return
  }

  accepting.value = true

  try {
    const result = await termsStore.acceptTerms(
      currentOrganizationId.value,
      props.termsVersion
    )

    emit('accepted', result)
  } catch (error) {
    console.error('Error accepting terms:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error al aceptar términos y condiciones'

    emit('error', error instanceof Error ? error : new Error(errorMessage))
  } finally {
    accepting.value = false
  }
}

const handleCancel = () => {
  if (accepting.value || props.blocking) return

  termsStore.hideModal()
  emit('cancelled')
}

// Auto-focus en el modal cuando se abre
watch(isModalVisible, (visible) => {
  if (visible) {
    // Enfocar el primer botón después de un tick
    setTimeout(() => {
      const firstButton = document.querySelector('.p-dialog .p-button') as HTMLElement
      firstButton?.focus()
    }, 100)
  }
})
</script>

<style scoped lang="scss">
.terms-acceptance-dialog {
  :deep(.p-dialog-content) {
    padding: 0;
  }

  :deep(.p-dialog-header) {
    padding: 1.5rem 1.5rem 0 1.5rem;
  }

  :deep(.p-dialog-footer) {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
}

.terms-modal-content {
  padding: 1.5rem;
}

.terms-scroll-content {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
}

.terms-sections {
  h4 {
    color: #374151;
    font-weight: 600;
  }

  p {
    line-height: 1.6;
  }
}
</style>
