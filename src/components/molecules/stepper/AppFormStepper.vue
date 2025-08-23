<script lang="ts" setup>
import { computed } from 'vue'

import Button from 'primevue/button'
import Step from 'primevue/step'
import StepList from 'primevue/steplist'
import StepPanel from 'primevue/steppanel'
import StepPanels from 'primevue/steppanels'
import Stepper from 'primevue/stepper'

import { useI18n } from 'vue-i18n'

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
  if (props.canNavigateToStep(stepId)) {
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
            'cursor-not-allowed opacity-50': !canNavigateToStep(step.id),
            'step-error': hasStepErrors(step.id)
          }"
          @click="handleStepClick(step.id)"
        >
          <template #default>
            <div class="flex items-center gap-2">
              <i v-if="step.icon" :class="step.icon" />
              <span>{{ step.label }}</span>
              <i v-if="hasStepErrors(step.id)" class="pi pi-exclamation-triangle text-red-500" />
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
              <Button
                v-if="!isFirstStep"
                :label="t('general.previous')"
                severity="secondary"
                size="small"
                icon="pi pi-arrow-left"
                @click="handlePrev"
                :disabled="isLoading"
              />
            </div>

            <div class="flex gap-3">
              <Button
                v-if="!isLastStep"
                :label="t('general.next')"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="small"
                @click="handleNext"
                :disabled="isLoading"
              />

              <Button
                v-if="isLastStep && showSubmit"
                :label="effectiveSubmitLabel"
                severity="primary"
                size="small"
                icon="pi pi-check"
                @click="handleSubmit"
                :loading="isLoading"
              />

              <Button
                :label="t('general.cancel')"
                severity="secondary"
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
:deep(.step-error .p-step-header) {
  border-color: var(--p-red-500);
  background-color: var(--p-red-50);
}

:deep(.step-error .p-step-title) {
  color: var(--p-red-500);
}

:deep(.p-step:not(.p-disabled)) {
  cursor: pointer;
}

:deep(.p-step.cursor-not-allowed) {
  cursor: not-allowed;
}
</style>
