<template>
  <TermsModal
    v-model:visible="isModalVisible"
    :loading="isAccepting"
    :blocking="blocking"
    @accept="acceptTerms"
  />
</template>

<script setup lang="ts">
import { toRef } from 'vue'

import { useTerms } from '@/composables/useTerms'

import TermsModal from './TermsModal.vue'

interface Props {
  organizationId: string
  blocking?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  blocking: false
})

const { isModalVisible, isAccepting, acceptTerms } = useTerms(toRef(props, 'organizationId'))
</script>
