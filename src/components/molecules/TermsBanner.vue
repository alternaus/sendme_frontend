<template>
  <Message
    v-if="!hasAccepted && !loading"
    severity="warn"
    :closable="false"
    class="terms-banner mb-4"
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
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'

import Button from 'primevue/button'
import Message from 'primevue/message'

import { useTermsAcceptance } from '@/composables/useTermsAcceptance'

interface Props {
  organizationId: string
}

const props = defineProps<Props>()

const organizationIdRef = toRef(props, 'organizationId')

const {
  hasAcceptedTerms: hasAccepted,
  termsStatus,
  showTermsModal
} = useTermsAcceptance(organizationIdRef)

const loading = computed(() => termsStatus.value.loading)

const showModal = () => {
  showTermsModal()
}
</script>

<style scoped lang="scss">
.terms-banner {
  :deep(.p-message-wrapper) {
    width: 100%;
  }

  :deep(.p-message-text) {
    width: 100%;
  }
}
</style>
