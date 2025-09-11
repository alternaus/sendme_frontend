<template>
  <div class="protected-page">
    <div class="page-header">
      <h1>{{ $t('contacts.title') }}</h1>
      <button
        class="btn btn--primary"
        @click="handleCreateContact"
        :disabled="isCreating || !hasAcceptedTerms"
      >
        <span v-if="isCreating" class="spinner"></span>
        {{ isCreating ? $t('contacts.creating') : $t('contacts.create') }}
      </button>
    </div>

    <!-- Indicador de términos pendientes -->
    <div v-if="!hasAcceptedTerms && !termsStatus.loading" class="terms-banner">
      <div class="terms-banner__content">
        <strong>{{ $t('terms.banner.title') }}</strong>
        <p>{{ $t('terms.banner.message') }}</p>
        <button class="btn btn--outline" @click="showTermsModal">
          {{ $t('terms.banner.action') }}
        </button>
      </div>
    </div>

    <div class="content">
      <!-- Contenido de la página -->
      <div v-if="termsStatus.loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('terms.checking') }}</p>
      </div>

      <div v-else-if="hasAcceptedTerms" class="contacts-list">
        <!-- Lista de contactos aquí -->
        <p>Lista de contactos (términos aceptados)</p>
      </div>

      <div v-else class="terms-required-state">
        <div class="terms-required__icon">🔒</div>
        <h3>{{ $t('terms.required.title') }}</h3>
        <p>{{ $t('terms.required.description') }}</p>
        <button class="btn btn--primary" @click="showTermsModal">
          {{ $t('terms.required.action') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'

import { useProtectedOperation,useTermsAcceptance } from '@/composables/useTermsAcceptance'

// Props para recibir organizationId
interface Props {
  organizationId: string
}

const props = defineProps<Props>()

const isCreating = ref(false)
const organizationIdRef = toRef(props, 'organizationId')

// Usar el composable de términos
const {
  termsStatus,
  hasAcceptedTerms,
  showTermsModal,
  checkTermsAcceptance
} = useTermsAcceptance(organizationIdRef)

// Usar operaciones protegidas
const { executeProtectedOperation } = useProtectedOperation(organizationIdRef)

// Función simulada de creación de contacto
const createContact = async () => {
  isCreating.value = true
  try {
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Contact created successfully')
  } finally {
    isCreating.value = false
  }
}

const handleCreateContact = async () => {
  await executeProtectedOperation(
    createContact,
    () => {
      console.log('Terms required before creating contact')
    }
  )
}

// Verificar términos al montar
onMounted(() => {
  checkTermsAcceptance()
})
</script>

<style scoped lang="scss">
.protected-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
}

.terms-banner {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;

  &__content {
    display: flex;
    align-items: center;
    gap: 16px;

    strong {
      color: #92400e;
      font-weight: 600;
    }

    p {
      color: #92400e;
      margin: 0;
      flex: 1;
    }
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  p {
    margin-top: 16px;
    color: #6b7280;
  }
}

.terms-required-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  &__icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px;
  }

  p {
    color: #6b7280;
    margin: 0 0 24px;
    max-width: 400px;
  }
}

.contacts-list {
  padding: 40px 20px;
  text-align: center;
  color: #059669;
  font-weight: 500;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background: #2563eb;
    }
  }

  &--outline {
    background: transparent;
    color: #92400e;
    border: 1px solid #f59e0b;

    &:hover:not(:disabled) {
      background: #fef3c7;
    }
  }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
