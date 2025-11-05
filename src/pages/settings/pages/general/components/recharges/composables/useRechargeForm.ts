import { computed, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'

import type { ICreateManualRecharge } from '@/services/organization/interfaces/create-manual-recharge.interface'
import type { IOrganization } from '@/services/organization/interfaces/organization.interface'
import { useOrganizationService } from '@/services/organization/useOrganizationService'

export const useRechargeForm = () => {
  const { t } = useI18n()
  const organizationService = useOrganizationService()

  const organizations = ref<IOrganization[]>([])
  const isLoadingOrganizations = ref(false)
  const isSubmitting = ref(false)
  const lastEditedField = ref<'amount' | 'messageCount'>('amount')

  const formData = ref<ICreateManualRecharge>({
    organizationId: '',
    amount: 0,
    messageCount: 0,
    notes: '',
    currencyCode: 'COP',
  })

  const errors = ref({
    organizationId: '',
    amount: '',
    messageCount: '',
  })

  const selectedOrganization = computed(() =>
    organizations.value.find(org => org.id === formData.value.organizationId)
  )

  const pricePerMessage = computed(() =>
    selectedOrganization.value?.plan?.pricePerMessage || 0
  )

  const organizationOptions = computed(() =>
    organizations.value.map(org => ({
      name: `${org.name} - $${org.plan?.pricePerMessage || 0}/mensaje`,
      value: org.id,
    }))
  )

  watch(() => formData.value.amount, (newAmount) => {
    if (lastEditedField.value === 'amount' && pricePerMessage.value > 0 && newAmount > 0) {
      formData.value.messageCount = Math.floor(newAmount / pricePerMessage.value)
    }
  })

  watch(() => formData.value.messageCount, (newMessageCount) => {
    if (lastEditedField.value === 'messageCount' && pricePerMessage.value > 0 && newMessageCount > 0) {
      formData.value.amount = newMessageCount * pricePerMessage.value
    }
  })

  watch(() => formData.value.organizationId, () => {
    if (pricePerMessage.value > 0) {
      if (formData.value.amount > 0) {
        formData.value.messageCount = Math.floor(formData.value.amount / pricePerMessage.value)
      } else if (formData.value.messageCount > 0) {
        formData.value.amount = formData.value.messageCount * pricePerMessage.value
      }
    }
  })

  const isFormValid = computed(() => {
    return (
      formData.value.organizationId !== '' &&
      formData.value.amount > 0 &&
      formData.value.messageCount > 0
    )
  })

  const validateForm = () => {
    errors.value = {
      organizationId: '',
      amount: '',
      messageCount: '',
    }

    let isValid = true

    if (!formData.value.organizationId) {
      errors.value.organizationId = t('settings.recharges.organization_required')
      isValid = false
    }

    if (formData.value.amount <= 0) {
      errors.value.amount = t('settings.recharges.amount_required')
      isValid = false
    }

    if (formData.value.messageCount <= 0) {
      errors.value.messageCount = t('settings.recharges.message_count_required')
      isValid = false
    }

    return isValid
  }

  const loadOrganizations = async () => {
    isLoadingOrganizations.value = true
    try {
      const response = await organizationService.listOrganizations()
      if (response) {
        organizations.value = response
      }
    } finally {
      isLoadingOrganizations.value = false
    }
  }

  const submitRecharge = async () => {
    if (!validateForm()) return false

    isSubmitting.value = true
    try {
      const response = await organizationService.createManualRecharge(formData.value)
      if (response) {
        resetForm()
        return true
      }
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  const resetForm = () => {
    formData.value = {
      organizationId: '',
      amount: 0,
      messageCount: 0,
      notes: '',
      currencyCode: 'COP',
    }
    errors.value = {
      organizationId: '',
      amount: '',
      messageCount: '',
    }
  }

  return {
    formData,
    errors,
    organizations,
    organizationOptions,
    selectedOrganization,
    pricePerMessage,
    isLoadingOrganizations,
    isSubmitting,
    isFormValid,
    lastEditedField,
    loadOrganizations,
    submitRecharge,
    resetForm,
  }
}
