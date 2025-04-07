import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface RechargeFilterForm {
  startDate: Date
  endDate: Date
}

export interface RechargeFilterFormRef {
  startDate: Ref<Date>
  endDate: Ref<Date>
}

export const useRechargesFilter = () => {
  const schema = yup.object<RechargeFilterForm>({
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
  })

  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<RechargeFilterForm>({
    validationSchema: schema,
    initialValues: {
      startDate: undefined,
      endDate: undefined,
    },
    validateOnMount: false,
  })

  const [startDate] = defineField('startDate')
  const [endDate] = defineField('endDate')

  return {
    startDate,
    endDate,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}