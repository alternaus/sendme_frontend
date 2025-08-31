import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface ContactFilterForm {
  search: string
  name: string
  countryCode: string
  status: string
  origin: string
}

export interface ContactFilterFormRef {
  search: Ref<string>
  name: Ref<string>
  countryCode: Ref<string>
  status: Ref<string>
  origin: Ref<string>
}

export const useContactFilter = () => {
  const schema = yup.object<ContactFilterForm>({
    search: yup.string(),
    name: yup.string(),
    countryCode: yup.string(),
    status: yup.string(),
    origin: yup.string(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<ContactFilterForm>({
    validationSchema: schema,
    initialValues: {
      search: '',
      name: '',
      countryCode: '',
      status: '',
      origin: '',
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
