import { computed } from 'vue'

import { useForm } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import * as yup from 'yup'

export interface PaymentFormData {
  name: string
  email: string
  company: string
}

export function usePaymentForm() {
  const { t } = useI18n()

  const validationSchema = yup.object({
    name: yup
      .string()
      .required(t('enrollment.validation.name_required'))
      .min(2, t('enrollment.validation.name_min_length'))
      .label(t('enrollment.full_name')),
    email: yup
      .string()
      .required(t('enrollment.validation.email_required'))
      .email(t('enrollment.validation.email_format'))
      .label(t('enrollment.email')),
    company: yup
      .string()
      .required(t('enrollment.validation.company_required'))
      .min(2, t('enrollment.validation.company_min_length'))
      .label(t('enrollment.company_name'))
  })

  const initialValues: PaymentFormData = {
    name: '',
    email: '',
    company: ''
  }

  const { defineField, handleSubmit, errors, meta, setFieldValue, resetForm } = useForm({
    validationSchema,
    initialValues
  })

  const [name, nameAttrs] = defineField('name')
  const [email, emailAttrs] = defineField('email')
  const [company, companyAttrs] = defineField('company')

  const nameError = computed(() => errors.value.name)
  const emailError = computed(() => errors.value.email)
  const companyError = computed(() => errors.value.company)

  const isFormValid = computed(() => {
    return meta.value.valid && meta.value.dirty
  })

  const getFormData = (): PaymentFormData => ({
    name: name.value,
    email: email.value,
    company: company.value
  })

  const validateForm = handleSubmit((values) => {
    return values
  })

  return {
    // Fields
    name,
    nameAttrs,
    email,
    emailAttrs,
    company,
    companyAttrs,

    // Errors
    errors,
    nameError,
    emailError,
    companyError,

    // Form state
    meta,
    isFormValid,
    getFormData,
    validateForm,
    setFieldValue,
    resetForm
  }
}
