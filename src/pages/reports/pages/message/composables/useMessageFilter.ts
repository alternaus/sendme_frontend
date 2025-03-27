import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import * as yup from 'yup'

export interface MessageFilterForm {
  content: string
  status: string
  messageType: string
  startDate: Date
  endDate: Date
}

export interface MessageFilterFormRef {
  content: Ref<string>
  status: Ref<string>
  messageType: Ref<string>
  startDate: Ref<Date>
  endDate: Ref<Date>
}

export const useMessageFilter = () => {
  const schema = yup.object<MessageFilterForm>({
    content: yup.string(),
    status: yup.string(),
    messageType: yup.string(),
    startDate: yup.date().nullable(),
    endDate: yup.date().nullable(),
  })
  const { defineField, handleSubmit, resetForm, errors, setValues } = useForm<MessageFilterForm>({
    validationSchema: schema,
    initialValues: {
      content: '',
      status: '',
      messageType: '',
      startDate: undefined,
      endDate: undefined,
    },
    validateOnMount: false,
  })
  const [content] = defineField('content')
  const [status] = defineField('status')
  const [messageType] = defineField('messageType')
  const [startDate] = defineField('startDate')
  const [endDate] = defineField('endDate')
  return {
    content,
    status,
    messageType,
    startDate,
    endDate,
    handleSubmit,
    resetForm,
    errors,
    setValues,
  }
}