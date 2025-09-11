<template>
  <div class="terms-demo-page">
    <!-- Header -->
    <div class="surface-section py-4 px-6 border-bottom-1 surface-border">
      <h1 class="text-3xl font-bold text-gray-800 m-0">
        Demo: Sistema de Términos y Condiciones
      </h1>
      <p class="text-gray-600 mt-2 mb-0">
        Demostración del sistema integrado con PrimeVue
      </p>
    </div>

    <!-- Controles de prueba -->
    <div class="surface-section p-6 border-bottom-1 surface-border">
      <div class="grid">
        <div class="col-12 md:col-6">
          <Card>
            <template #title>Controles de Prueba</template>
            <template #content>
              <div class="flex flex-column gap-3">
                <Button
                  label="Mostrar Modal de Términos"
                  icon="pi pi-file-check"
                  @click="showTermsModal"
                />

                <Button
                  label="Verificar Estado de Términos"
                  icon="pi pi-refresh"
                  severity="secondary"
                  outlined
                  @click="checkTerms"
                />

                <Button
                  label="Simular Operación Protegida"
                  icon="pi pi-shield"
                  severity="success"
                  @click="testProtectedOperation"
                />
              </div>
            </template>
          </Card>
        </div>

        <div class="col-12 md:col-6">
          <Card>
            <template #title>Estado Actual</template>
            <template #content>
              <div class="flex flex-column gap-3">
                <div class="flex align-items-center gap-2">
                  <i
                    :class="[
                      'pi',
                      hasAcceptedTerms ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'
                    ]"
                  ></i>
                  <span>
                    Términos: {{ hasAcceptedTerms ? 'Aceptados' : 'No aceptados' }}
                  </span>
                </div>

                <div class="flex align-items-center gap-2">
                  <i
                    :class="[
                      'pi',
                      termsStatus.loading ? 'pi-spin pi-spinner' : 'pi-info-circle'
                    ]"
                  ></i>
                  <span>
                    Estado: {{ termsStatus.loading ? 'Verificando...' : 'Listo' }}
                  </span>
                </div>

                <div v-if="termsStatus.error" class="flex align-items-center gap-2">
                  <i class="pi pi-exclamation-triangle text-yellow-500"></i>
                  <span class="text-sm text-gray-600">{{ termsStatus.error }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Banner de términos -->
    <div class="p-6">
      <TermsBanner :organization-id="organizationId" />
    </div>

    <!-- Contenido principal -->
    <div class="p-6">
      <div v-if="hasAcceptedTerms" class="grid">
        <div class="col-12">
          <Card>
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-check-circle text-green-500"></i>
                <span>Contenido Protegido Desbloqueado</span>
              </div>
            </template>
            <template #content>
              <p class="m-0">
                ¡Perfecto! Los términos han sido aceptados y ahora puedes acceder a todo el contenido protegido.
              </p>

              <Divider />

              <DataTable
                :value="sampleData"
                :paginator="true"
                :rows="5"
                responsiveLayout="scroll"
              >
                <Column field="id" header="ID"></Column>
                <Column field="name" header="Nombre"></Column>
                <Column field="status" header="Estado">
                  <template #body="slotProps">
                    <Tag
                      :value="slotProps.data.status"
                      :severity="slotProps.data.status === 'Activo' ? 'success' : 'warning'"
                    />
                  </template>
                </Column>
                <Column field="date" header="Fecha"></Column>
              </DataTable>
            </template>
          </Card>
        </div>
      </div>

      <!-- Estado bloqueado -->
      <div v-else-if="!termsStatus.loading">
        <TermsRequiredState :organization-id="organizationId" />
      </div>

      <!-- Estado de carga -->
      <div v-else class="text-center py-8">
        <ProgressSpinner />
        <p class="mt-4 text-gray-600">{{ $t('terms.checking') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'

import TermsBanner from '@/components/molecules/TermsBanner.vue'
import TermsRequiredState from '@/components/molecules/TermsRequiredState.vue'
import { useProtectedOperation,useTermsAcceptance } from '@/composables/useTermsAcceptance'

const organizationId = 'demo-organization-123'

const {
  termsStatus,
  hasAcceptedTerms,
  showTermsModal,
  checkTermsAcceptance
} = useTermsAcceptance(organizationId)

const { executeProtectedOperation } = useProtectedOperation(organizationId)

// Datos de ejemplo para la tabla
const sampleData = ref([
  { id: 1, name: 'Contacto 1', status: 'Activo', date: '2024-01-15' },
  { id: 2, name: 'Contacto 2', status: 'Inactivo', date: '2024-01-16' },
  { id: 3, name: 'Contacto 3', status: 'Activo', date: '2024-01-17' },
  { id: 4, name: 'Contacto 4', status: 'Activo', date: '2024-01-18' },
  { id: 5, name: 'Contacto 5', status: 'Inactivo', date: '2024-01-19' },
])

const checkTerms = async () => {
  await checkTermsAcceptance(true) // force refresh
}

const testProtectedOperation = async () => {
  await executeProtectedOperation(
    async () => {
      // Simular operación que requiere términos
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Operación protegida ejecutada exitosamente')
      return 'Operación completada'
    },
    () => {
      console.log('Se requiere aceptar términos para esta operación')
    }
  )
}

onMounted(() => {
  checkTermsAcceptance()
})
</script>

<style scoped lang="scss">
.terms-demo-page {
  min-height: 100vh;
  background: var(--surface-50);
}
</style>
