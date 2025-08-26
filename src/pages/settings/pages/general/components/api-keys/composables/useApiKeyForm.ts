import { useForm } from 'vee-validate'
import * as yup from 'yup'

export interface ApiKeyForm {
  name: string
}

export function useApiKeysForm() {
  const schema: yup.Schema<ApiKeyForm> = yup.object({
    name: yup.string().trim().min(3).max(64).required(),
  })

  const { defineField, handleSubmit, resetForm, errors } = useForm<ApiKeyForm>({
    validationSchema: schema,
    initialValues: { name: '' },
  })

  const [name] = defineField('name')

  return { form: { name }, handleSubmit, resetForm, errors }
}
