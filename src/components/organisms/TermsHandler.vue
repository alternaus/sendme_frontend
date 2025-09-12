<template>
  <div>
    <!-- Banner cuando no ha aceptado -->
    <Message
      v-if="showBanner && !hasAccepted && !isLoading"
      severity="warn"
      :closable="false"
      class="mb-4"
    >
      <div class="flex align-items-center justify-content-between w-full">
        <div class="flex-1">
          <strong class="block mb-1">{{ $t('terms.banner.title') }}</strong>
          <span>{{ $t('terms.banner.message') }}</span>
        </div>
        <Button
          :label="$t('terms.banner.action')"
          size="small"
          outlined
          @click="showModal"
        />
      </div>
    </Message>

    <!-- Estado bloqueante cuando es requerido -->
    <Card v-if="showBlockingState && !hasAccepted" class="text-center">
      <template #content>
        <div class="flex flex-column align-items-center gap-4">
          <i class="pi pi-lock text-6xl text-yellow-500"></i>
          <h3 class="text-2xl font-semibold text-gray-800 m-0">
            {{ $t('terms.required.title') }}
          </h3>
          <p class="text-gray-600 max-w-md mx-auto line-height-3 m-0">
            {{ $t('terms.required.description') }}
          </p>
          <Button
            :label="$t('terms.required.action')"
            icon="pi pi-check"
            size="large"
            @click="showModal"
          />
        </div>
      </template>
    </Card>

    <!-- Content slot solo se muestra si términos aceptados -->
    <slot v-if="hasAccepted || !blocking" />

    <!-- Modal unificado -->
    <TermsModal
      v-model:visible="isModalVisible"
      :loading="isAccepting"
      :blocking="blocking"
      @accept="acceptTerms"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'

import { useTerms } from '@/composables/useTerms'

import TermsModal from './TermsModal.vue'

interface Props {
  organizationId: string
  mode?: 'banner' | 'blocking' | 'modal-only'
  blocking?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'banner',
  blocking: false
})

const { hasAccepted, isLoading, isModalVisible, isAccepting, acceptTerms, showModal } = useTerms(
  toRef(props, 'organizationId')
)

const showBanner = computed(() => props.mode === 'banner')
const showBlockingState = computed(() => props.mode === 'blocking' || props.blocking)
</script>

<style scoped lang="scss">
:deep(.p-message-wrapper) {
  width: 100%;
}

:deep(.p-message-text) {
  width: 100%;
}
</style>
