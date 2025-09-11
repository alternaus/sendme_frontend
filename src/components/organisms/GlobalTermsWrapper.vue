<template>
  <div class="app-wrapper">
    <slot />

    <!-- Modal Global de Términos y Condiciones -->
    <TermsAcceptanceModal
      :blocking="true"
      @accepted="handleTermsAccepted"
      @error="handleTermsError"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import TermsAcceptanceModal from '@/components/organisms/TermsAcceptanceModal.vue'
import { useTermsStore } from '@/stores/termsStore'

const _termsStore = useTermsStore()

const handleTermsAccepted = (data: unknown) => {
  console.log('Terms accepted:', data)
  // Los términos han sido aceptados, la aplicación puede continuar
}

const handleTermsError = (error: Error) => {
  console.error('Error accepting terms:', error)
  // Manejar error de aceptación de términos
}

// Verificar términos al montar el componente
onMounted(() => {
  // Aquí podrías verificar los términos si tienes un organizationId disponible
  // Por ejemplo, desde un store global o de autenticación
})
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  width: 100%;
}
</style>
