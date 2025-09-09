import { computed } from 'vue'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface PaymentFormData {
  name: string
  email: string
  dni: string
  company: string
}

export function usePaymentForm() {
  const { t } = useI18n()

  const validationSchema = yup.object({
    name: yup
      .string()
      .required(t('enrollment.validation.name_required'))
      .min(2, t('enrollment.validation.name_min_length'))
  .label(t('enrollment.form.full_name')),
    email: yup
      .string()
      .required(t('enrollment.validation.email_required'))
      .email(t('enrollment.validation.email_format'))
  .label(t('enrollment.form.email')),
    dni: yup
      .string()
      .required(t('enrollment.validation.dni_required'))
      .min(8, t('enrollment.validation.dni_min_length'))
      .max(15, t('enrollment.validation.dni_max_length'))
  .label(t('enrollment.form.dni')),
    company: yup
      .string()
      .required(t('enrollment.validation.company_required'))
      .min(2, t('enrollment.validation.company_min_length'))
  .label(t('enrollment.form.company_name'))
  })

  const initialValues: PaymentFormData = {
    name: '',
    email: '',
    dni: '',
    company: ''
  }

  const { defineField, handleSubmit, errors, meta, setFieldValue, resetForm, validate } = useForm({
    validationSchema,
    initialValues
  })

  const [name, nameAttrs] = defineField('name')
  const [email, emailAttrs] = defineField('email')
  const [dni, dniAttrs] = defineField('dni')
  const [company, companyAttrs] = defineField('company')

  const nameError = computed(() => errors.value.name)
  const emailError = computed(() => errors.value.email)
  const dniError = computed(() => errors.value.dni)
  const companyError = computed(() => errors.value.company)

  const isFormValid = computed(() => {
    const nameValid = Boolean(name.value?.trim())
    const emailValid = Boolean(email.value?.trim())
    const dniValid = Boolean(dni.value?.trim())
    const companyValid = Boolean(company.value?.trim())

    const allFieldsFilled = nameValid && emailValid && dniValid && companyValid

    const hasNoErrors = Object.keys(errors.value).length === 0

    if (!allFieldsFilled) {
      return false
    }

    const nameLengthOk = (name.value?.trim().length || 0) >= 2
    const dniLengthOk = (dni.value?.trim().length || 0) >= 8
    const emailFormatOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value?.trim() || '')
    const companyLengthOk = (company.value?.trim().length || 0) >= 2

    const validFormats = nameLengthOk && dniLengthOk && emailFormatOk && companyLengthOk

    return allFieldsFilled && hasNoErrors && validFormats
  })

  const getFormData = (): PaymentFormData => ({
    name: name.value,
    email: email.value,
    dni: dni.value,
    company: company.value
  })

  const validateForm = handleSubmit((values) => {
    return values
  })

  const validateAllFields = async () => {
    return await validate()
  }

  return {
    // Fields
    name,
    nameAttrs,
    email,
    emailAttrs,
    dni,
    dniAttrs,
    company,
    companyAttrs,

    // Errors
    errors,
    nameError,
    emailError,
    dniError,
    companyError,

    // Form state
    meta,
    isFormValid,
    getFormData,
    validateForm,
    validateAllFields,
    setFieldValue,
    resetForm
  }
}
