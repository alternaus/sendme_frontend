import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface AuditFilterForm {
  action: string
  table: string
  startDate: Date
  endDate: Date
  search: string
}

export interface AuditFilterFormRef {
  action: Ref<string>
  table: Ref<string>
  startDate: Ref<Date>
  endDate: Ref<Date>
  search: Ref<string>
}

export const useAuditFilter = () => {
  const schema = yup.object<AuditFilterForm>({
    action: yup.string(),
    table: yup.string(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
    search: yup.string(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<AuditFilterForm>({
    validationSchema: schema,
    initialValues: {
      action: '',
      table: '',
      startDate: null,
      endDate: null,
      search: '',
    },
    validateOnMount: false,
  })

  const [action] = defineField('action')
  const [table] = defineField('table')
  const [startDate] = defineField('startDate')
  const [endDate] = defineField('endDate')
  const [search] = defineField('search')

  return {
    action,
    table,
    startDate,
    endDate,
    search,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}