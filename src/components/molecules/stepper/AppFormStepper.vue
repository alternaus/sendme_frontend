<script lang="ts" setup>
import { computed } from 'vue'

import Step from 'primevue/step'
import StepList from 'primevue/steplist'
import StepPanel from 'primevue/steppanel'
import StepPanels from 'primevue/steppanels'
import Stepper from 'primevue/stepper'

import { useI18n } from 'vue-i18n'

import AppButton from '@/components/atoms/buttons/AppButton.vue'
import type { StepConfig } from '@/composables/useFormStepper'

interface Props {
  steps: StepConfig[]
  currentStep: string
  isFirstStep: boolean
  isLastStep: boolean
  canNavigateToStep: (stepId: string) => boolean
  hasStepErrors: (stepId: string) => boolean
  isLoading?: boolean
  submitLabel?: string
  showSubmit?: boolean
}

interface Emits {
  (e: 'next'): void
  (e: 'prev'): void
  (e: 'goTo', stepId: string): void
  (e: 'submit'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  submitLabel: '',
  showSubmit: true
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

const effectiveSubmitLabel = computed(() =>
  props.submitLabel || t('general.save')
)

const handleStepClick = (stepId: string) => {
  if (!props.canNavigateToStep(stepId)) {
    return
  }

  if (stepId !== props.currentStep) {
    emit('goTo', stepId)
  }
}

const handleNext = async () => {
  emit('next')
}

const handlePrev = () => {
  emit('prev')
}

const handleSubmit = () => {
  emit('submit')
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="w-full">
    <Stepper :value="currentStep" class="basis-full">
      <StepList>
        <Step
          v-for="step in steps"
          :key="step.id"
          :value="step.id"
          :class="{
            'cursor-pointer': canNavigateToStep(step.id),
            'cursor-not-allowed': !canNavigateToStep(step.id),
          }"
          @click="handleStepClick(step.id)"
        >
          <template #default>
            <div class="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200" :class="{
              'bg-[var(--p-primary-color)] text-[var(--p-primary-contrast-color)]': step.id === currentStep,
              'text-gray-700 dark:text-gray-600': step.id !== currentStep && canNavigateToStep(step.id),
              'text-gray-600 dark:text-gray-500': !canNavigateToStep(step.id),
              'border-1 border-red-400 bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-300': hasStepErrors(step.id)
            }">
              <i v-if="step.icon" :class="step.icon" />
              <span>{{ step.label }}</span>
            </div>
          </template>
        </Step>
      </StepList>

      <StepPanels>
        <StepPanel
          v-for="step in steps"
          :key="step.id"
          :value="step.id"
          v-slot="{ activateCallback }"
          class="p-2 rounded-xl shadow-md"
        >
          <div>
            <slot :name="`step-${step.id}`" :activateCallback="activateCallback" />
          </div>

          <div class="flex justify-between my-2">
            <div>
              <AppButton
                v-if="!isFirstStep"
                :label="t('general.previous')"
                severity="contrast"
                size="small"
                outlined
                icon="pi pi-arrow-left"
                @click="handlePrev"
                :disabled="isLoading"
              />
            </div>

            <div class="flex gap-3">
              <AppButton
                v-if="!isLastStep"
                :label="t('general.next')"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="small"
                @click="handleNext"
                :disabled="isLoading"
              />

              <AppButton
                v-if="isLastStep && showSubmit"
                :label="effectiveSubmitLabel"
                severity="primary"
                size="small"
                icon="pi pi-check"
                @click="handleSubmit"
                :loading="isLoading"
              />

              <AppButton
                :label="t('general.cancel')"
                severity="contrast"
                outlined
                size="small"
                @click="handleCancel"
                :disabled="isLoading"
              />
            </div>
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </div>
</template>

<style scoped>

/* Asegurar que el step activo tenga prioridad visual */
[data-pc-name="step"][data-p-active="true"] {
  position: relative;
  z-index: 1;
}
</style>
