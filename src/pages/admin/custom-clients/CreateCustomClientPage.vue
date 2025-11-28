<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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
    const route = useRoute()
    const { t } = useI18n()
    const toast = useToast()

    const isEditing = computed(() => !!route.params.id)

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
    } = useCustomClientForm({ isEditing: isEditing.value })

    const { createClientWithExistingPlan, createClientWithCustomPlan, getClientDetails, updateClient } = useOrganizationService()

    const isLoading = ref(false)

    onMounted(async () => {
      if (isEditing.value) {
        isLoading.value = true
        try {
          const client = await getClientDetails(route.params.id as string)

          // Populate form
          form.orgName.value = client.organization.name
          form.orgDocument.value = client.organization.document || ''
          form.orgDocumentType.value = client.organization.documentType || 'NIT'
          form.orgEmail.value = client.organization.email || ''
          form.orgPhone.value = client.organization.phone
          form.orgCountry.value = client.organization.country
          form.orgCity.value = client.organization.city || ''
          form.orgAddress.value = client.organization.address || ''

          // Default to custom plan for editing to show current values
          form.planType.value = 'custom'

          form.planName.value = client.plan.planName
          form.subscriptionPrice.value = client.plan.subscriptionPrice
          form.includedMessages.value = client.plan.includedMessages
          form.messagePrice.value = client.plan.messagePrice
          form.resetDay.value = client.plan.resetDay
          form.campaignLimit.value = client.plan.campaignLimit
          form.contactLimit.value = client.plan.contactLimit
          form.tagLimit.value = client.plan.tagLimit
          form.customFieldLimit.value = client.plan.customFieldLimit

          if (client.managers && client.managers.length > 0) {
            form.managers.value = client.managers.map(m => ({
              name: m.name,
              email: m.email,
              password: '' // Password not returned
            }))
          }

          // Ensure we start at step 1
          await goToStep('1')

        } catch {
          toast.add({ severity: 'error', summary: t('common.general.error'), detail: t('custom_clients.messages.load_error'), life: 3000 })
          router.push({ name: 'custom-clients.index' })
        } finally {
          isLoading.value = false
        }
      }
    })

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

        if (isEditing.value) {
           await updateClient(route.params.id as string, {
             organization: data.organization,
             plan: form.planType.value === 'custom' ? data.customPlan : undefined,
             planId: form.planType.value === 'existing' ? form.selectedPlanId.value as string : undefined
           })
           toast.add({
            severity: 'success',
            summary: t('common.general.success'),
            detail: t('custom_clients.messages.update_success'),
            life: 3000,
          })
        } else {
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
        }

        router.push({ name: 'custom-clients.index' })
      } catch {
        toast.add({
          severity: 'error',
          summary: t('common.general.error'),
          detail: isEditing.value ? t('custom_clients.messages.update_error') : t('custom_clients.messages.create_error'),
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
    const title = computed(() => isEditing.value ? t('custom_clients.form.edit_title') : t('custom_clients.form.title'))

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
      title,
      IconTypes,
      isEditing,
    }
  },
})
</script>

<template>
  <AppHeader :icon="IconTypes.SETTINGS" :title="title" :actions="[]" />

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
          :readonly="isEditing"
          @update:form="updateFormContent"
        />
      </template>

      <template #step-5>
        <CustomClientFormConfirmation :form="form" />
      </template>
    </AppFormStepper>
  </form>
</template>
