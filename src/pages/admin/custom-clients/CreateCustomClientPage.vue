<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useToast } from 'primevue/usetoast'

import { useI18n } from 'vue-i18n'

import AppHeader from '@/components/molecules/header/AppHeader.vue'
import { IconTypes } from '@/components/molecules/header/enums/icon-types.enum'
import AppFormStepper from '@/components/molecules/stepper/AppFormStepper.vue'
import { useCustomClientForm } from '@/composables/useCustomClientForm'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

import CustomClientFormConfirmation from './form/CustomClientFormConfirmation.vue'
import CustomClientFormCustomPlan from './form/CustomClientFormCustomPlan.vue'
import CustomClientFormManagers from './form/CustomClientFormManagers.vue'
import CustomClientFormOrganization from './form/CustomClientFormOrganization.vue'
import CustomClientFormPlanType from './form/CustomClientFormPlanType.vue'

export default defineComponent({
  components: {
    AppHeader,
    AppFormStepper,
    CustomClientFormPlanType,
    CustomClientFormOrganization,
    CustomClientFormCustomPlan,
    CustomClientFormManagers,
    CustomClientFormConfirmation,
  },

  setup() {
    const router = useRouter()
    const { t } = useI18n()
    const toast = useToast()

    const {
      form,
      handleSubmit,
      errors,
      steps,
      currentStep,
      isFirstStep,
      isLastStep,
      nextStep,
      prevStep,
      goToStep,
      canNavigateToStep,
      hasStepErrors,
    } = useCustomClientForm()

    const { createClientWithExistingPlan, createClientWithCustomPlan } = useOrganizationService()

    const isLoading = ref(false)

    const handleNext = async () => {
      await nextStep()
    }

    const handlePrev = async () => {
      await prevStep()
    }

    const handleGoToStep = async (stepId: string) => {
      await goToStep(stepId)
    }

    const handleCancel = () => {
      router.push({ name: 'custom-clients.index' })
    }

    const formatClientData = () => {
      return {
        organization: {
          name: form.orgName.value as string,
          document: form.orgDocument.value as string,
          documentType: form.orgDocumentType.value as string,
          email: form.orgEmail.value as string,
          phone: form.orgPhone.value as string,
          country: form.orgCountry.value as string,
          city: form.orgCity.value as string,
          address: form.orgAddress.value as string,
        },
        managers: form.managers.value as Array<{ name: string; email: string; password: string }>,
        customPlan: form.planType.value === 'custom' ? {
          planName: form.planName.value as string,
          subscriptionPrice: form.subscriptionPrice.value as number,
          includedMessages: form.includedMessages.value as number,
          messagePrice: form.messagePrice.value as number,
          resetDay: form.resetDay.value as number,
          campaignLimit: form.campaignLimit.value as number,
          contactLimit: form.contactLimit.value as number,
          tagLimit: form.tagLimit.value as number,
          customFieldLimit: form.customFieldLimit.value as number,
        } : undefined,
      }
    }

    const onSubmitForm = handleSubmit(async () => {
      isLoading.value = true
      try {
        const data = formatClientData()

        if (form.planType.value === 'existing' && form.selectedPlanId.value) {
          await createClientWithExistingPlan(form.selectedPlanId.value as string, {
            organization: data.organization,
            managers: data.managers,
          })
        } else if (data.customPlan) {
          await createClientWithCustomPlan({
            organization: data.organization,
            managers: data.managers,
            customPlan: data.customPlan,
          })
        }

        toast.add({
          severity: 'success',
          summary: t('common.general.success'),
          detail: t('custom_clients.messages.create_success'),
          life: 3000,
        })
        router.push({ name: 'custom-clients.index' })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('common.general.error'),
          detail: t('custom_clients.messages.create_error'),
          life: 3000,
        })
      } finally {
        isLoading.value = false
      }
    })

    const updateFormContent = <K extends keyof typeof form>(field: K, value: (typeof form)[K]['value']) => {
      form[field].value = value
    }

    const save = computed(() => t('common.general.save'))

    return {
      form,
      errors,
      steps,
      currentStep,
      isFirstStep,
      isLastStep,
      canNavigateToStep,
      hasStepErrors,
      isLoading,
      handleNext,
      handlePrev,
      handleGoToStep,
      handleCancel,
      onSubmitForm,
      updateFormContent,
      save,
      IconTypes,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :title="$t('custom_clients.form.title')" :actions="[]" />

  <form @submit.prevent="onSubmitForm" class="w-full flex flex-col gap-4 pt-4" autocomplete="off">
    <AppFormStepper
      :steps="steps"
      :current-step="currentStep"
      :is-first-step="isFirstStep"
      :is-last-step="isLastStep"
      :can-navigate-to-step="canNavigateToStep"
      :has-step-errors="hasStepErrors"
      :is-loading="isLoading"
      :submit-label="save"
      @next="handleNext"
      @prev="handlePrev"
      @go-to="handleGoToStep"
      @submit="onSubmitForm"
      @cancel="handleCancel"
    >
      <template #step-1>
        <CustomClientFormPlanType
          :form="form"
          :errors="errors"
          @update:form="updateFormContent"
        />
      </template>

      <template #step-2>
        <CustomClientFormOrganization
          :form="form"
          :errors="errors"
          @update:form="updateFormContent"
        />
      </template>

      <template v-if="form.planType.value === 'custom'" #step-3>
        <CustomClientFormCustomPlan
          :form="form"
          :errors="errors"
          @update:form="updateFormContent"
        />
      </template>

      <template #step-4>
        <CustomClientFormManagers
          :form="form"
          :errors="errors"
          @update:form="updateFormContent"
        />
      </template>

      <template #step-5>
        <CustomClientFormConfirmation :form="form" />
      </template>
    </AppFormStepper>
  </form>
</template>
