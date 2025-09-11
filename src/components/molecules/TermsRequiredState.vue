<template>
  <div class="terms-required-state">
    <Card class="text-center">
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
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'

import Button from 'primevue/button'
import Card from 'primevue/card'

import { useTermsAcceptance } from '@/composables/useTermsAcceptance'

interface Props {
  organizationId: string
}

const props = defineProps<Props>()

const organizationIdRef = toRef(props, 'organizationId')

const { showTermsModal } = useTermsAcceptance(organizationIdRef)

const showModal = () => {
  showTermsModal()
}
</script>

<style scoped lang="scss">
.terms-required-state {
  padding: 3rem 1rem;
  max-width: 500px;
  margin: 0 auto;
}
</style>
