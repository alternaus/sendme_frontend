import { useForm } from 'vee-validate'
import * as yup from 'yup'

export interface SettingsForm {
  dateFormat: string
  timeFormat: string
  timezone: string
}

export function useSettingsForm() {
  const schema: yup.Schema<SettingsForm> = yup.object({
    dateFormat: yup.string().required(),
    timeFormat: yup.string().required(),
    timezone: yup.string().required(),
  })

  const { defineField, handleSubmit, setValues, resetForm, errors } = useForm<SettingsForm>({
    validationSchema: schema,
    initialValues: {
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
      timezone: 'UTC',
    },
  })

  const [dateFormat] = defineField('dateFormat')
  const [timeFormat]  = defineField('timeFormat')
  const [timezone]    = defineField('timezone')

  return { form: { dateFormat, timeFormat, timezone }, handleSubmit, setValues, resetForm, errors }
}
