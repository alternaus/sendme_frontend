import { useForm } from 'vee-validate'
import * as yup from 'yup'

export interface EmailConfigForm {
  name: string
  host: string
  port: number | null
  secure: boolean
  username: string
  password?: string
  fromEmail: string
  fromName: string
  isDefault: boolean
  isActive: boolean
}

export function useMailProviderForm() {
  const schema: yup.Schema<EmailConfigForm> = yup.object({
  name: yup.string().required(),
  host: yup.string().required(),
  port: yup.number().typeError('Port required').min(1).max(65535).required(),
  secure: yup.boolean().required(),
  username: yup.string().required(),
  password: yup.string().optional(),
  fromEmail: yup.string().email().required(),
  fromName: yup.string().required(),
  isDefault: yup.boolean().required(),
  isActive: yup.boolean().required(),
})

  const { defineField, handleSubmit, setValues, resetForm, errors } = useForm<EmailConfigForm>({
    validationSchema: schema,
    initialValues: {
      name: '',
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      isDefault: false,
      isActive: true,
    },
  })

  const [name] = defineField('name')
  const [host] = defineField('host')
  const [port] = defineField('port')
  const [secure] = defineField('secure')
  const [username] = defineField('username')
  const [password] = defineField('password')
  const [fromEmail] = defineField('fromEmail')
  const [fromName] = defineField('fromName')
  const [isDefault] = defineField('isDefault')
  const [isActive] = defineField('isActive')

  return {
    form: { name, host, port, secure, username, password, fromEmail, fromName, isDefault, isActive },
    handleSubmit, setValues, resetForm, errors,
  }
}
