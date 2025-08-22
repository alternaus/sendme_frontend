<template>
  <div class="job-notification-container">
    <!-- Notificación de Job con progreso -->
    <div v-if="job" class="job-notification">
      <!-- Header del job -->
      <div class="job-header">
        <div class="job-title-section">
          <h4 class="job-title">{{ getJobTitle() }}</h4>
          <Tag
            :value="getJobTypeLabel()"
            :severity="getJobTypeSeverity()"
            class="job-type-tag"
          />
        </div>
        <div class="job-meta">
          <span class="job-id">Job: {{ job.jobId }}</span>
          <span class="job-time">{{ formatElapsedTime() }}</span>
        </div>
      </div>

      <!-- Barra de progreso -->
      <div v-if="job.isActive" class="progress-section">
        <div class="progress-header">
          <span class="progress-text">Progreso: {{ job.progress }}%</span>
          <span class="progress-stats">
            {{ job.processed }} procesados
            <span v-if="job.errors > 0" class="error-count">
              - {{ job.errors }} errores
            </span>
          </span>
        </div>
        <ProgressBar
          :value="job.progress"
          :severity="getProgressSeverity()"
          class="job-progress-bar"
        />
      </div>

      <!-- Resultados finales -->
      <div v-else class="completion-section">
        <div class="completion-grid">
          <div class="stat-item success">
            <i class="pi pi-check-circle"></i>
            <div>
              <span class="stat-value">{{ job.processed - job.errors }}</span>
              <span class="stat-label">Exitosos</span>
            </div>
          </div>

          <div v-if="job.errors > 0" class="stat-item error">
            <i class="pi pi-times-circle"></i>
            <div>
              <span class="stat-value">{{ job.errors }}</span>
              <span class="stat-label">Errores</span>
            </div>
          </div>

          <div class="stat-item total">
            <i class="pi pi-list"></i>
            <div>
              <span class="stat-value">{{ job.total || 0 }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>

        <!-- Mostrar errores si existen -->
        <div v-if="job.errorDetails && job.errorDetails.length > 0" class="error-details">
          <Accordion>
            <AccordionTab :header="`Ver errores (${job.errorDetails.length})`">
              <div class="error-list">
                <div
                  v-for="(error, index) in job.errorDetails.slice(0, 10)"
                  :key="index"
                  class="error-item"
                >
                  <i class="pi pi-exclamation-triangle error-icon"></i>
                  <span class="error-text">{{ error }}</span>
                </div>
                <div v-if="job.errorDetails.length > 10" class="error-more">
                  Y {{ job.errorDetails.length - 10 }} errores más...
                </div>
              </div>
            </AccordionTab>
          </Accordion>
        </div>
      </div>

      <!-- Footer con acciones -->
      <div class="job-footer">
        <div class="job-actions">
          <Button
            v-if="!job.isActive && job.jobType === 'contact_import'"
            icon="pi pi-download"
            label="Ver reporte"
            size="small"
            outlined
            @click="$emit('viewReport', job.jobId)"
          />
          <Button
            icon="pi pi-times"
            severity="secondary"
            size="small"
            outlined
            @click="$emit('dismiss', job.jobId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'

import type { JobProgress } from '@/composables/useJobNotifications'

// ===============================================
// PROPS Y EVENTOS
// ===============================================

interface Props {
  job: JobProgress
}

interface Emits {
  (e: 'dismiss', jobId: string): void
  (e: 'viewReport', jobId: string): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// ===============================================
// COMPUTED PROPERTIES
// ===============================================

// Obtener título del job basado en el tipo y estado
const getJobTitle = (): string => {
  const jobType = props.job.jobType || 'unknown'

  if (props.job.isActive) {
    switch (jobType) {
      case 'contact_import':
        return 'Importación de contactos en progreso'
      case 'contact_export':
        return 'Exportación de contactos en progreso'
      case 'data_sync':
        return 'Sincronización de datos en progreso'
      default:
        return 'Proceso en progreso'
    }
  } else {
    switch (jobType) {
      case 'contact_import':
        return props.job.errors === 0
          ? 'Importación de contactos completada'
          : 'Importación de contactos finalizada con errores'
      case 'contact_export':
        return props.job.errors === 0
          ? 'Exportación de contactos completada'
          : 'Exportación de contactos finalizada con errores'
      case 'data_sync':
        return props.job.errors === 0
          ? 'Sincronización de datos completada'
          : 'Sincronización de datos finalizada con errores'
      default:
        return props.job.errors === 0
          ? 'Proceso completado'
          : 'Proceso finalizado con errores'
    }
  }
}

// Obtener etiqueta del tipo de job
const getJobTypeLabel = (): string => {
  switch (props.job.jobType) {
    case 'contact_import':
      return 'Importación'
    case 'contact_export':
      return 'Exportación'
    case 'data_sync':
      return 'Sincronización'
    default:
      return 'Proceso'
  }
}

// Obtener severidad del tipo de job
const getJobTypeSeverity = (): string => {
  switch (props.job.jobType) {
    case 'contact_import':
      return 'info'
    case 'contact_export':
      return 'success'
    case 'data_sync':
      return 'warning'
    default:
      return 'secondary'
  }
}

// Obtener severidad de la barra de progreso
const getProgressSeverity = (): string => {
  if (props.job.errors > 0) return 'danger'
  if (props.job.progress < 50) return 'info'
  return 'success'
}

// Formatear tiempo transcurrido
const formatElapsedTime = (): string => {
  if (!props.job.startTime) return '00:00'

  const endTime = props.job.endTime || new Date()
  const elapsed = Math.floor((endTime.getTime() - props.job.startTime.getTime()) / 1000)

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.job-notification-container {
  padding: 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-card);
  margin-bottom: 0.5rem;
}

.job-notification {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;

  .job-title-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;

    .job-title {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .job-type-tag {
      font-size: 0.75rem;
    }
  }

  .job-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-color-secondary);

    .job-id {
      font-family: 'Courier New', monospace;
      background: var(--surface-100);
      padding: 0.125rem 0.25rem;
      border-radius: 4px;
    }
  }
}

.progress-section {
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;

    .progress-text {
      font-weight: 600;
      color: var(--text-color);
    }

    .progress-stats {
      color: var(--text-color-secondary);

      .error-count {
        color: var(--red-500);
        font-weight: 600;
      }
    }
  }

  .job-progress-bar {
    height: 0.5rem;
  }
}

.completion-section {
  .completion-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: 6px;
      background: var(--surface-50);

      i {
        font-size: 1.25rem;
      }

      .stat-value {
        display: block;
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1;
      }

      .stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        line-height: 1;
      }

      &.success {
        i { color: var(--green-500); }
        .stat-value { color: var(--green-600); }
      }

      &.error {
        i { color: var(--red-500); }
        .stat-value { color: var(--red-600); }
      }

      &.total {
        i { color: var(--blue-500); }
        .stat-value { color: var(--blue-600); }
      }
    }
  }
}

.error-details {
  margin-top: 1rem;

  .error-list {
    max-height: 200px;
    overflow-y: auto;

    .error-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--surface-border);

      &:last-child {
        border-bottom: none;
      }

      .error-icon {
        color: var(--orange-500);
        margin-top: 0.125rem;
        flex-shrink: 0;
      }

      .error-text {
        font-size: 0.875rem;
        line-height: 1.4;
        color: var(--text-color);
      }
    }

    .error-more {
      padding: 0.5rem 0;
      text-align: center;
      font-style: italic;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }
  }
}

.job-footer {
  .job-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

// Responsive
@media (max-width: 768px) {
  .job-header {
    flex-direction: column;
    align-items: stretch;

    .job-meta {
      align-items: flex-start;
    }
  }

  .completion-section .completion-grid {
    grid-template-columns: 1fr;
  }
}
</style>
