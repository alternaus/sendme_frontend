import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface DispatchFilterForm {
  search: string
  campaignId: string
  startDate: Date
  endDate: Date
}

export interface DispatchFilterFormRef {
  search: Ref<string>
  campaignId: Ref<string>
  startDate: Ref<Date>
  endDate: Ref<Date>
}

export const useDispatchFilter = () => {
  const schema = yup.object<DispatchFilterForm>({
    search: yup.string(),
    campaignId: yup.string(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<DispatchFilterForm>({
    validationSchema: schema,
    initialValues: {
      search: '',
      campaignId: '',
      startDate: undefined,
      endDate: undefined,
    },
    validateOnMount: false,
  })

  const [search] = defineField('search')
  const [campaignId] = defineField('campaignId')
  const [startDate] = defineField('startDate')
  const [endDate] = defineField('endDate')

  return {
    search,
    campaignId,
    startDate,
    endDate,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}
