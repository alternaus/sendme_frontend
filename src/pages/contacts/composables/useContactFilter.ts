import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

import { useStatusColors } from '@/composables/useStatusColors'
import type { ContactOrigin } from '@/services/contact/enums/contact-origin.enum'
import type { ContactStatus } from '@/services/contact/enums/contact-status.enum'

export interface ContactFilterForm {
  search: string
  name: string
  countryCode: string
  status: ContactStatus
  origin?: ContactOrigin
}

export interface ContactFilterFormRef {
  search: Ref<string>
  name: Ref<string>
  countryCode: Ref<string>
  status: Ref<ContactStatus | null>
  origin: Ref<ContactOrigin | null>
}

export const useContactFilter = () => {
  const { getStatusesForType } = useStatusColors()

  const validStatuses = ['', ...getStatusesForType('contact')]

  const schema = yup.object<ContactFilterForm>({
    search: yup.string(),
    name: yup.string(),
    countryCode: yup.string(),
    status: yup.string().oneOf(validStatuses),
    origin: yup.string(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<ContactFilterForm>({
    validationSchema: schema,
    initialValues: {
      search: '',
      name: '',
      countryCode: '',
      status:undefined,
      origin: undefined,
    },
    validateOnMount: false,
  })

  const [search] = defineField('search')
  const [name] = defineField('name')
  const [countryCode] = defineField('countryCode')
  const [status] = defineField('status')
  const [origin] = defineField('origin')

  return {
    search,
    name,
    countryCode,
    status,
    origin,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}
